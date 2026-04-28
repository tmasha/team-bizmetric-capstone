from __future__ import annotations

from unittest.mock import patch

from backend.app import create_app
from backend.tests.helpers import BackendTestCase


class MonitoringTests(BackendTestCase):
    def test_health_reports_monitoring_state(self):
        response = self.client.get("/health")
        payload = response.get_json()

        self.assertEqual(response.status_code, 200)
        self.assertIn("monitoring", payload)
        self.assertEqual(payload["monitoring"]["provider"], "none")
        self.assertFalse(payload["monitoring"]["enabled"])

    def test_request_id_is_returned_on_api_responses(self):
        response = self.client.get("/api/tools?domain=demo", headers=self.dev_headers())
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.headers["x-request-id"])

    def test_connection_string_enables_or_gracefully_degrades_monitoring(self):
        with patch("azure.monitor.opentelemetry.configure_azure_monitor"):
            app = create_app(
                {
                    "TESTING": True,
                    "DATABASE_PATH": f"{self.tempdir.name}/monitoring.db",
                    "DISABLE_DB_SEED": True,
                    "ALLOW_DEV_AUTH": True,
                    "AZURE_MONITOR_CONNECTION_STRING": (
                        "InstrumentationKey=11111111-1111-1111-1111-111111111111;"
                        "IngestionEndpoint=https://westus-0.in.applicationinsights.azure.com/"
                    ),
                }
            )

        provider = app.extensions["monitoring"]["provider"]
        self.assertIn(provider, {"azure-monitor", "unavailable"})
        if provider == "azure-monitor":
            self.assertTrue(app.extensions["monitoring"]["enabled"])
        else:
            self.assertFalse(app.extensions["monitoring"]["enabled"])
