import json
from pathlib import Path

from backend.tests.helpers import BackendTestCase


FIXTURE_PATH = Path(__file__).resolve().parents[2] / "fixtures" / "prompts" / "prompt_injection_cases.json"


class PromptInjectionSecurityTests(BackendTestCase):
    def test_prompt_injection_corpus_is_blocked(self):
        cases = json.loads(FIXTURE_PATH.read_text())
        for case in cases:
            with self.subTest(case=case["name"]):
                response = self.client.post(
                    "/api/chat",
                    json={"sessionId": None, "message": case["message"], "domain": case["domain"]},
                    headers=self.dev_headers(role="user"),
                )
                payload = response.get_json()
                self.assertEqual(response.status_code, 200)
                self.assertEqual(payload["decision"], case["expectedDecision"])
