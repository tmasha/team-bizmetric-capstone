from __future__ import annotations

import json
import time
from uuid import uuid4

from flask import Blueprint, Response, current_app, g, jsonify, request
from werkzeug.exceptions import BadRequest, HTTPException, NotFound

from backend.app.audit import create_audit_event, get_session_events, get_session_messages, load_dashboard_metrics
from backend.app.auth import load_user_context
from backend.app.db import get_db, utcnow_iso
from backend.app.monitoring import emit_event
from backend.app.openapi import build_openapi_spec
from backend.app.policies import DOMAINS, TOOL_RULES, analyze_message, evaluate_policy, list_tool_access
from backend.app.providers import get_chat_provider
from backend.app.sanitization import redact_value


api = Blueprint("api", __name__)


def _require_json() -> dict:
    if not request.is_json:
        raise BadRequest("Expected application/json request body.")
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        raise BadRequest("Invalid JSON request body.")
    return payload


def _load_request_context():
    g.request_id = request.headers.get("x-request-id", uuid4().hex)
    if request.path.startswith("/api"):
        g.user_context = load_user_context()


def _create_or_load_session(session_id: str | None, domain: str):
    db = get_db()
    if session_id:
        session = db.execute("SELECT * FROM chat_sessions WHERE id = ?", (session_id,)).fetchone()
        if session:
            db.execute(
                "UPDATE chat_sessions SET updated_at = ?, domain = ? WHERE id = ?",
                (utcnow_iso(), domain, session_id),
            )
            db.commit()
            return dict(session)

    user = g.user_context
    new_session_id = uuid4().hex
    now = utcnow_iso()
    db.execute(
        """
        INSERT INTO chat_sessions (id, user_id, user_email, role, domain, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            new_session_id,
            user.user_id,
            user.email,
            user.primary_role,
            domain,
            "active",
            now,
            now,
        ),
    )
    db.commit()
    return {
        "id": new_session_id,
        "user_id": user.user_id,
        "user_email": user.email,
        "role": user.primary_role,
        "domain": domain,
        "status": "active",
        "created_at": now,
        "updated_at": now,
    }


def _store_message(session_id: str, request_id: str, role: str, content: str, decision: str | None, tool_name: str | None):
    db = get_db()
    db.execute(
        """
        INSERT INTO chat_messages (id, session_id, request_id, role, content, decision, tool_name, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (uuid4().hex, session_id, request_id, role, content, decision, tool_name, utcnow_iso()),
    )
    db.execute(
        "UPDATE chat_sessions SET updated_at = ? WHERE id = ?",
        (utcnow_iso(), session_id),
    )
    db.commit()


@api.before_app_request
def before_request():
    _load_request_context()


@api.get("/health")
def health():
    db = get_db()
    db.execute("SELECT 1").fetchone()
    mcp_clients = current_app.extensions.get("mcp_clients", {})
    monitoring = current_app.extensions.get("monitoring", {})
    return jsonify(
        {
            "status": "ok",
            "service": current_app.config["APP_NAME"],
            "version": current_app.config["VERSION"],
            "environment": current_app.config["ENVIRONMENT"],
            "chatProvider": current_app.config["CHAT_PROVIDER"],
            "mcpTransport": current_app.config["MCP_TRANSPORT"],
            "mcpServers": sorted(mcp_clients.keys()),
            "monitoring": {
                "enabled": monitoring.get("enabled", False),
                "provider": monitoring.get("provider", "none"),
            },
            "database": {"ready": True, "path": current_app.config["DATABASE_PATH"]},
        }
    )


@api.get("/openapi.json")
def openapi_spec():
    return jsonify(build_openapi_spec())


@api.get("/api/tools")
def tools():
    domain = request.args.get("domain", "demo")
    if domain not in DOMAINS:
        raise BadRequest("Invalid domain.")
    access = list_tool_access(g.user_context.roles, domain)
    return jsonify(
        {
            "domain": domain,
            "user": {
                "userId": g.user_context.user_id,
                "email": g.user_context.email,
                "roles": g.user_context.roles,
                "primaryRole": g.user_context.primary_role,
                "source": g.user_context.source,
            },
            **access,
        }
    )


@api.post("/api/chat")
def chat():
    payload = _require_json()
    message = str(payload.get("message", "")).strip()
    if not message:
        raise BadRequest("Message is required.")

    domain = payload.get("domain")
    if domain not in DOMAINS:
        raise BadRequest("Domain must be one of demo, finance, ops, hr.")

    session = _create_or_load_session(payload.get("sessionId"), domain)
    request_id = g.request_id
    intent = analyze_message(message, domain)
    decision, policy_reason = evaluate_policy(g.user_context.roles, domain, intent)
    access = list_tool_access(g.user_context.roles, domain)
    provider = get_chat_provider(current_app.config["CHAT_PROVIDER"])

    _store_message(session["id"], request_id, "user", message, None, intent.requested_tool)

    tool_executions = []
    audit_event_ids = []
    started_at = time.perf_counter()

    if decision == "allowed" and intent.requested_tool:
        rule = TOOL_RULES[intent.requested_tool]
        client = current_app.extensions["mcp_clients"][rule["server"]]
        tool_result = client.call_tool(
            intent.requested_tool,
            intent.arguments,
            {
                "domain": domain,
                "requestId": request_id,
                "userId": g.user_context.user_id,
                "role": g.user_context.primary_role,
            },
        )
        structured = redact_value(tool_result.get("structuredContent", {}))
        tool_executions.append(
            {
                "name": intent.requested_tool,
                "server": rule["server"],
                "status": "success",
                "structuredContent": structured,
            }
        )
        audit_event_ids.append(
            create_audit_event(
                request_id=request_id,
                session_id=session["id"],
                user_id=g.user_context.user_id,
                user_email=g.user_context.email,
                role=g.user_context.primary_role,
                domain=domain,
                tool_name=intent.requested_tool,
                action_type=rule["action_type"],
                decision="allowed",
                policy_reason=policy_reason,
                backend_target=rule["server"],
                result_status="success",
                latency_ms=int((time.perf_counter() - started_at) * 1000),
                metadata={"arguments": intent.arguments, "result": structured},
                prompt_text=message,
            )
        )

    assistant_message = provider.build_reply(
        decision=decision,
        requested_tool=intent.requested_tool,
        tool_results=tool_executions,
        policy_reason=policy_reason,
        domain=domain,
        role=g.user_context.primary_role,
    )

    _store_message(session["id"], request_id, "assistant", assistant_message, decision, intent.requested_tool)

    audit_event_ids.append(
        create_audit_event(
            request_id=request_id,
            session_id=session["id"],
            user_id=g.user_context.user_id,
            user_email=g.user_context.email,
            role=g.user_context.primary_role,
            domain=domain,
            tool_name=intent.requested_tool,
            action_type=(
                TOOL_RULES[intent.requested_tool]["action_type"]
                if intent.requested_tool
                else ("Prompt Injection" if "prompt_injection" in intent.policy_flags else "Conversation")
            ),
            decision=decision,
            policy_reason=policy_reason,
            backend_target="policy-engine",
            result_status=decision,
            latency_ms=int((time.perf_counter() - started_at) * 1000),
            metadata={
                "requestedTool": intent.requested_tool,
                "arguments": intent.arguments,
                "policyFlags": intent.policy_flags,
                "toolAccess": access,
            },
            prompt_text=message,
        )
    )

    emit_event(
        current_app,
        "chat_turn_completed",
        request_id=request_id,
        session_id=session["id"],
        decision=decision,
        domain=domain,
        role=g.user_context.primary_role,
        requested_tool=intent.requested_tool,
        audit_event_ids=audit_event_ids,
        tool_execution_count=len(tool_executions),
    )

    return jsonify(
        {
            "requestId": request_id,
            "sessionId": session["id"],
            "decision": decision,
            "assistantMessage": assistant_message,
            "toolExecutions": tool_executions,
            "policySummary": {
                "decision": decision,
                "requestedTool": intent.requested_tool,
                "policyReason": policy_reason,
                "policyFlags": intent.policy_flags,
                "allowedTools": access["allowedTools"],
                "restrictedTools": access["restrictedTools"],
                "role": g.user_context.primary_role,
                "domain": domain,
            },
            "auditEventIds": audit_event_ids,
        }
    )


@api.get("/api/audit/<session_id>")
def audit_view(session_id: str):
    db = get_db()
    session = db.execute("SELECT * FROM chat_sessions WHERE id = ?", (session_id,)).fetchone()
    if session is None:
        raise NotFound("Session not found.")

    events = get_session_events(session_id)
    messages = get_session_messages(session_id)
    return jsonify({"session": dict(session), "messages": messages, "events": events})


@api.get("/api/dashboard/metrics")
def dashboard_metrics():
    window = request.args.get("window", "24h")
    return jsonify(load_dashboard_metrics(window))


@api.app_errorhandler(BadRequest)
@api.app_errorhandler(NotFound)
def handle_known_errors(error):
    return jsonify({"error": error.description}), error.code


@api.app_errorhandler(HTTPException)
def handle_http_exception(error):
    return jsonify({"error": error.description}), error.code


@api.app_errorhandler(Exception)
def handle_unexpected_error(error):
    current_app.logger.exception("Unhandled backend error", exc_info=error)
    payload = {"error": "Internal server error"}
    if current_app.config["DEBUG"] or current_app.config["TESTING"]:
        payload["details"] = str(error)
    return Response(json.dumps(payload), status=500, mimetype="application/json")


def register_routes(app):
    app.register_blueprint(api)
