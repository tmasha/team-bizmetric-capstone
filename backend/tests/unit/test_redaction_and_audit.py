from backend.app.audit import create_audit_event, get_session_events
from backend.app.db import get_db
from backend.app.sanitization import redact_value
from backend.tests.helpers import BackendTestCase


class RedactionAndAuditTests(BackendTestCase):
    def test_redact_value_masks_emails_and_tokens(self):
        payload = {
            "owner": "person@example.com",
            "token": "secret-token",
            "nested": {"password": "abc123"},
        }
        redacted = redact_value(payload)
        self.assertEqual(redacted["token"], "[REDACTED]")
        self.assertEqual(redacted["nested"]["password"], "[REDACTED]")
        self.assertEqual(redacted["owner"], "[REDACTED]")

    def test_audit_event_is_persisted(self):
        with self.app.app_context():
            db = get_db()
            db.execute(
                """
                INSERT INTO chat_sessions (id, user_id, user_email, role, domain, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                ("session-1", "user-1", "user@bizmetric.local", "user", "demo", "active", "2026-01-01T00:00:00+00:00", "2026-01-01T00:00:00+00:00"),
            )
            db.commit()
            event_id = create_audit_event(
                request_id="req-1",
                session_id="session-1",
                user_id="user-1",
                user_email="user@bizmetric.local",
                role="user",
                domain="demo",
                tool_name="list_records",
                action_type="Query Executed",
                decision="allowed",
                policy_reason="Allowed by test policy.",
                backend_target="business-read",
                result_status="success",
                latency_ms=12,
                metadata={"token": "do-not-store"},
                prompt_text="Show demo records",
            )
            events = get_session_events("session-1")

        self.assertEqual(len(events), 1)
        self.assertEqual(events[0]["id"], event_id)
        self.assertIn("[REDACTED]", events[0]["metadata"])
