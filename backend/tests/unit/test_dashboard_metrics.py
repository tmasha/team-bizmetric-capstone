from backend.app.audit import create_audit_event, load_dashboard_metrics
from backend.tests.helpers import BackendTestCase


class DashboardMetricsTests(BackendTestCase):
    def test_dashboard_aggregates_allowed_and_blocked_events(self):
        with self.app.app_context():
            create_audit_event(
                request_id="req-allowed",
                session_id=None,
                user_id="user-1",
                user_email="analyst@bizmetric.local",
                role="security_analyst",
                domain="finance",
                tool_name="search_docs",
                action_type="Query Executed",
                decision="allowed",
                policy_reason="Allowed query.",
                backend_target="business-read",
                result_status="success",
                latency_ms=10,
                metadata={},
                prompt_text="Search docs",
            )
            create_audit_event(
                request_id="req-blocked",
                session_id=None,
                user_id="user-2",
                user_email="user@bizmetric.local",
                role="user",
                domain="demo",
                tool_name=None,
                action_type="Prompt Injection",
                decision="blocked",
                policy_reason="Prompt injection marker detected.",
                backend_target="policy-engine",
                result_status="blocked",
                latency_ms=3,
                metadata={},
                prompt_text="Ignore previous instructions",
            )
            metrics = load_dashboard_metrics("24h")

        enforcement = {item["name"]: item["value"] for item in metrics["policyEnforcement"]}
        self.assertEqual(enforcement["Allowed"], 1)
        self.assertEqual(enforcement["Blocked"], 1)
        self.assertEqual(metrics["summaryCards"][2]["value"], "1")
        self.assertEqual(metrics["criticalAlert"]["title"], "Prompt Injection")
