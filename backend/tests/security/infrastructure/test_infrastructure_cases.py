from backend.tests.helpers import BackendTestCase


class InfrastructureSecurityTests(BackendTestCase):
    def test_invalid_apim_secret_is_rejected(self):
        headers = self.apim_headers(role="user")
        headers["x-apim-shared-secret"] = "wrong-secret"
        response = self.client.get("/api/tools?domain=demo", headers=headers)
        self.assertEqual(response.status_code, 403)

    def test_openapi_and_health_are_public(self):
        openapi_response = self.client.get("/openapi.json")
        health_response = self.client.get("/health")

        self.assertEqual(openapi_response.status_code, 200)
        self.assertEqual(health_response.status_code, 200)
