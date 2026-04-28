from __future__ import annotations

import json
import logging
import time

from flask import Flask, g, has_request_context, request

from backend.app.sanitization import redact_value


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if hasattr(record, "event_data"):
            payload["event"] = redact_value(record.event_data)
        if has_request_context():
            payload["request"] = {
                "method": request.method,
                "path": request.path,
                "requestId": getattr(g, "request_id", None),
            }
        return json.dumps(payload, sort_keys=True)


def emit_event(app: Flask, name: str, **event_data):
    logger = app.logger
    logger.info(name, extra={"event_data": {"name": name, **redact_value(event_data)}})

    monitoring = app.extensions.get("monitoring", {})
    tracer = monitoring.get("tracer")
    if tracer:
        with tracer.start_as_current_span(name) as span:
            for key, value in redact_value(event_data).items():
                span.set_attribute(f"app.{key}", _stringify_attribute(value))

    meter = monitoring.get("meter")
    if meter:
        counter = monitoring.get("request_counter")
        if counter and name == "http_request_completed":
            counter.add(1, redact_value(_metric_dimensions(event_data)))


def _stringify_attribute(value):
    if isinstance(value, (str, int, float, bool)):
        return value
    return json.dumps(value, sort_keys=True)


def _metric_dimensions(event_data: dict) -> dict:
    return {
        "path": str(event_data.get("path", "unknown")),
        "method": str(event_data.get("method", "unknown")),
        "status_code": str(event_data.get("status_code", "unknown")),
    }


def _configure_logger(app: Flask):
    level_name = str(app.config.get("LOG_LEVEL", "INFO")).upper()
    level = getattr(logging, level_name, logging.INFO)
    app.logger.setLevel(level)

    has_json_handler = any(getattr(handler, "_bizmetric_json", False) for handler in app.logger.handlers)
    if not has_json_handler:
        handler = logging.StreamHandler()
        handler._bizmetric_json = True  # type: ignore[attr-defined]
        handler.setFormatter(JsonFormatter())
        handler.setLevel(level)
        app.logger.handlers = [handler]


def _configure_azure_monitor(app: Flask):
    connection_string = app.config.get("AZURE_MONITOR_CONNECTION_STRING", "").strip()
    monitoring = {
        "enabled": False,
        "provider": "none",
        "tracer": None,
        "meter": None,
        "request_counter": None,
    }

    if not connection_string:
        app.extensions["monitoring"] = monitoring
        return

    try:
        from azure.monitor.opentelemetry import configure_azure_monitor
        from opentelemetry import metrics, trace
    except ImportError:
        app.logger.warning(
            "azure_monitor_not_installed",
            extra={"event_data": {"connectionStringConfigured": True}},
        )
        monitoring["provider"] = "unavailable"
        app.extensions["monitoring"] = monitoring
        return

    configure_azure_monitor(connection_string=connection_string)
    service_name = app.config.get("OTEL_SERVICE_NAME", app.config["APP_NAME"])
    tracer = trace.get_tracer(service_name)
    meter = metrics.get_meter(service_name)
    request_counter = meter.create_counter(
        name="bizmetric.http.server.requests",
        description="HTTP requests completed by the BizMetric control plane",
    )
    monitoring.update(
        {
            "enabled": True,
            "provider": "azure-monitor",
            "tracer": tracer,
            "meter": meter,
            "request_counter": request_counter,
        }
    )
    app.extensions["monitoring"] = monitoring


def init_monitoring(app: Flask):
    _configure_logger(app)
    _configure_azure_monitor(app)

    @app.before_request
    def _start_request_timer():
        g.request_started_at = time.perf_counter()

    @app.after_request
    def _record_request(response):
        response.headers["x-request-id"] = getattr(g, "request_id", "unknown")
        latency_ms = int((time.perf_counter() - getattr(g, "request_started_at", time.perf_counter())) * 1000)
        emit_event(
            app,
            "http_request_completed",
            method=request.method,
            path=request.path,
            status_code=response.status_code,
            latency_ms=latency_ms,
        )
        return response
