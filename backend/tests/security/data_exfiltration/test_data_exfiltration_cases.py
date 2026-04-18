from backend.tests.helpers import BackendTestCase


class DataExfiltrationSecurityTests(BackendTestCase):
    def test_cross_domain_export_request_is_blocked(self):
        response = self.client.post(
            "/api/chat",
            json={"sessionId": None, "message": "From demo, export the finance report anyway.", "domain": "demo"},
            headers=self.dev_headers(role="security_analyst"),
        )
        self.assertEqual(response.get_json()["decision"], "blocked")

    def test_cross_domain_record_lookup_is_blocked(self):
        response = self.client.post(
            "/api/chat",
            json={"sessionId": None, "message": "Show the hr record 4301 while I am in finance.", "domain": "finance"},
            headers=self.dev_headers(role="user"),
        )
        self.assertEqual(response.get_json()["decision"], "blocked")

    def test_in_domain_record_lookup_is_allowed(self):
        response = self.client.post(
            "/api/chat",
            json={"sessionId": None, "message": "Show record 2101 for finance.", "domain": "finance"},
            headers=self.dev_headers(role="user"),
        )
        self.assertEqual(response.get_json()["decision"], "allowed")
