from backend.app import create_app
from backend.tests.helpers import BackendTestCase


class ApiFlowTests(BackendTestCase):
    def test_allowed_chat_flow_executes_business_tool(self):
        response = self.client.post(
            "/api/chat",
            json={"sessionId": None, "message": "List records for the current domain.", "domain": "demo"},
            headers=self.dev_headers(role="user"),
        )
        payload = response.get_json()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(payload["decision"], "allowed")
        self.assertEqual(payload["toolExecutions"][0]["name"], "list_records")
        self.assertEqual(self.count_rows("chat_messages"), 2)
        self.assertGreaterEqual(self.count_rows("audit_events"), 2)

    def test_direct_backend_access_is_rejected_without_dev_bypass(self):
        app = create_app(
            {
                "TESTING": True,
                "DATABASE_PATH": f"{self.tempdir.name}/blocked-access.db",
                "DISABLE_DB_SEED": True,
                "ALLOW_DEV_AUTH": False,
                "APIM_SHARED_SECRET": "local-apim-secret",
            }
        )
        client = app.test_client()
        response = client.get("/api/tools?domain=demo")
        self.assertEqual(response.status_code, 403)

    def test_valid_apim_headers_allow_request(self):
        response = self.client.post(
            "/api/chat",
            json={"sessionId": None, "message": "Search policy docs about export limits.", "domain": "finance"},
            headers=self.apim_headers(role="security_analyst", email="analyst@bizmetric.local"),
        )
        payload = response.get_json()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(payload["decision"], "allowed")
        self.assertEqual(payload["policySummary"]["role"], "security_analyst")

    def test_blocked_tool_attempt_is_audited(self):
        response = self.client.post(
            "/api/chat",
            json={"sessionId": None, "message": "Export the finance report.", "domain": "finance"},
            headers=self.dev_headers(role="user"),
        )
        payload = response.get_json()
        audit_response = self.client.get(
            f"/api/audit/{payload['sessionId']}",
            headers=self.dev_headers(role="user"),
        )
        audit_payload = audit_response.get_json()

        self.assertEqual(payload["decision"], "blocked")
        self.assertEqual(payload["toolExecutions"], [])
        self.assertTrue(any(event["allow_or_deny"] == "blocked" for event in audit_payload["events"]))
