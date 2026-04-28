from __future__ import annotations

from backend.app.audit import parse_window
from backend.app.openapi import build_openapi_spec
from backend.app.providers import get_chat_provider
from backend.app.providers.azure_openai import AzureOpenAIChatProvider
from backend.app.providers.mock import MockChatProvider
from backend.app.sanitization import build_excerpt, redact_value
from backend.tests.helpers import BackendTestCase


class ProviderAndContractTests(BackendTestCase):
    def test_provider_selection_defaults_to_mock(self):
        provider = get_chat_provider("mock")
        self.assertIsInstance(provider, MockChatProvider)

    def test_provider_selection_supports_azure_stub(self):
        provider = get_chat_provider("azure_openai")
        self.assertIsInstance(provider, AzureOpenAIChatProvider)
        blocked_reply = provider.build_reply(
            decision="blocked",
            requested_tool=None,
            tool_results=[],
            policy_reason="blocked for test",
            domain="demo",
            role="user",
        )
        self.assertIn("blocked", blocked_reply.lower())

        with self.assertRaises(RuntimeError):
            provider.build_reply(
                decision="allowed",
                requested_tool=None,
                tool_results=[],
                policy_reason="ok",
                domain="demo",
                role="user",
            )

    def test_openapi_spec_contains_required_paths(self):
        spec = build_openapi_spec()

        self.assertEqual(spec["openapi"], "3.0.3")
        self.assertIn("/api/chat", spec["paths"])
        self.assertIn("/api/tools", spec["paths"])
        self.assertIn("ChatRequest", spec["components"]["schemas"])
        self.assertIn("ChatResponse", spec["components"]["schemas"])

    def test_parse_window_supports_hours_days_and_fallback(self):
        self.assertEqual(parse_window("24h").total_seconds(), 24 * 60 * 60)
        self.assertEqual(parse_window("7d").total_seconds(), 7 * 24 * 60 * 60)
        self.assertEqual(parse_window("invalid").total_seconds(), 24 * 60 * 60)

    def test_redact_value_redacts_lists_and_build_excerpt_truncates(self):
        payload = redact_value(
            {
                "contacts": ["alpha@example.com", "beta@example.com"],
                "nested": [{"secret": "abc"}, {"password": "def"}],
            }
        )
        excerpt = build_excerpt("x" * 150, limit=20)

        self.assertEqual(payload["contacts"], ["[REDACTED]", "[REDACTED]"])
        self.assertEqual(payload["nested"][0]["secret"], "[REDACTED]")
        self.assertEqual(payload["nested"][1]["password"], "[REDACTED]")
        self.assertEqual(excerpt, "x" * 17 + "...")
