from __future__ import annotations

from unittest.mock import patch

from backend.app.auth import load_user_context
from backend.tests.helpers import BackendTestCase


class AuthAndRouteTests(BackendTestCase):
    def test_apim_multiple_roles_resolve_highest_priority_role(self):
        response = self.client.get(
            "/api/tools?domain=demo",
            headers={
                **self.apim_headers(role="user", email="analyst@bizmetric.local"),
                "x-user-roles": "user, security_analyst",
            },
        )
        payload = response.get_json()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(payload["user"]["primaryRole"], "security_analyst")
        self.assertEqual(payload["user"]["source"], "apim")

    def test_dev_auth_defaults_to_user_role_when_roles_are_missing(self):
        with self.app.test_request_context(
            "/api/tools?domain=demo",
            headers={"x-debug-user-email": "demo@bizmetric.local"},
        ):
            user = load_user_context()

        self.assertEqual(user.primary_role, "user")
        self.assertEqual(user.roles, ["user"])
        self.assertFalse(user.via_apim)

    def test_chat_rejects_invalid_json_payload(self):
        response = self.client.post(
            "/api/chat",
            data="[",
            content_type="application/json",
            headers=self.dev_headers(),
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json()["error"], "Invalid JSON request body.")

    def test_chat_returns_400_for_invalid_domain(self):
        response = self.client.post(
            "/api/chat",
            json={"sessionId": None, "message": "List records", "domain": "legal"},
            headers=self.dev_headers(),
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("Domain must be one of", response.get_json()["error"])

    def test_chat_reuses_existing_session(self):
        first = self.client.post(
            "/api/chat",
            json={"sessionId": None, "message": "List records for demo.", "domain": "demo"},
            headers=self.dev_headers(),
        ).get_json()

        second = self.client.post(
            "/api/chat",
            json={
                "sessionId": first["sessionId"],
                "message": "No tool needed here, just acknowledge.",
                "domain": "demo",
            },
            headers=self.dev_headers(),
        ).get_json()

        self.assertEqual(second["sessionId"], first["sessionId"])
        self.assertEqual(self.count_rows("chat_sessions"), 1)
        self.assertEqual(self.count_rows("chat_messages"), 4)

    def test_chat_without_tool_returns_allowed_response(self):
        response = self.client.post(
            "/api/chat",
            json={"sessionId": None, "message": "Hello there.", "domain": "demo"},
            headers=self.dev_headers(),
        )
        payload = response.get_json()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(payload["decision"], "allowed")
        self.assertEqual(payload["toolExecutions"], [])
        self.assertEqual(payload["policySummary"]["requestedTool"], None)

    def test_audit_view_returns_404_for_missing_session(self):
        response = self.client.get("/api/audit/missing-session", headers=self.dev_headers())
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.get_json()["error"], "Session not found.")

    def test_unexpected_exception_returns_json_500(self):
        with patch("backend.app.routes.get_chat_provider", side_effect=RuntimeError("provider failed")):
            response = self.client.post(
                "/api/chat",
                json={"sessionId": None, "message": "List records", "domain": "demo"},
                headers=self.dev_headers(),
            )

        payload = response.get_json()
        self.assertEqual(response.status_code, 500)
        self.assertEqual(payload["error"], "Internal server error")
        self.assertIn("provider failed", payload["details"])
