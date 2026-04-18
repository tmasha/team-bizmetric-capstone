from backend.tests.helpers import BackendTestCase


class ToolAbuseSecurityTests(BackendTestCase):
    def test_standard_user_cannot_submit_change(self):
        response = self.client.post(
            "/api/chat",
            json={"sessionId": None, "message": "Submit change to patch the dispatch queue.", "domain": "ops"},
            headers=self.dev_headers(role="user"),
        )
        self.assertEqual(response.get_json()["decision"], "blocked")

    def test_security_analyst_can_export_row_limited_report(self):
        response = self.client.post(
            "/api/chat",
            json={"sessionId": None, "message": "Export the finance report.", "domain": "finance"},
            headers=self.dev_headers(role="security_analyst"),
        )
        payload = response.get_json()
        self.assertEqual(payload["decision"], "allowed")
        self.assertEqual(payload["toolExecutions"][0]["name"], "export_report")

    def test_override_approval_is_review_required(self):
        response = self.client.post(
            "/api/chat",
            json={"sessionId": None, "message": "Approve override for the maintenance queue.", "domain": "ops"},
            headers=self.dev_headers(role="admin"),
        )
        self.assertEqual(response.get_json()["decision"], "review_required")
