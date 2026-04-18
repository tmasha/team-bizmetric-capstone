from __future__ import annotations

import hashlib
import json
from collections import Counter
from datetime import datetime, timedelta, timezone
from uuid import uuid4

from backend.app.db import get_db, utcnow_iso
from backend.app.sanitization import build_excerpt, redact_value


def hash_prompt(message: str) -> str:
    return hashlib.sha256(message.encode("utf-8")).hexdigest()


def create_audit_event(
    *,
    request_id: str,
    session_id: str | None,
    user_id: str,
    user_email: str,
    role: str,
    domain: str,
    tool_name: str | None,
    action_type: str,
    decision: str,
    policy_reason: str,
    backend_target: str,
    result_status: str,
    latency_ms: int,
    metadata: dict,
    prompt_text: str,
) -> str:
    db = get_db()
    event_id = uuid4().hex
    db.execute(
        """
        INSERT INTO audit_events (
            id, request_id, session_id, user_id, user_email, role, domain, tool_name,
            action_type, allow_or_deny, policy_reason, backend_target, result_status,
            latency_ms, metadata, excerpt, prompt_hash, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            event_id,
            request_id,
            session_id,
            user_id,
            user_email,
            role,
            domain,
            tool_name,
            action_type,
            decision,
            policy_reason,
            backend_target,
            result_status,
            latency_ms,
            json.dumps(redact_value(metadata)),
            build_excerpt(prompt_text),
            hash_prompt(prompt_text),
            utcnow_iso(),
        ),
    )
    db.commit()
    return event_id


def serialize_rows(rows) -> list[dict]:
    return [dict(row) for row in rows]


def get_session_messages(session_id: str) -> list[dict]:
    db = get_db()
    rows = db.execute(
        """
        SELECT id, session_id, request_id, role, content, decision, tool_name, created_at
        FROM chat_messages
        WHERE session_id = ?
        ORDER BY created_at ASC
        """,
        (session_id,),
    ).fetchall()
    return serialize_rows(rows)


def get_session_events(session_id: str) -> list[dict]:
    db = get_db()
    rows = db.execute(
        """
        SELECT id, request_id, session_id, user_id, user_email, role, domain, tool_name,
               action_type, allow_or_deny, policy_reason, backend_target, result_status,
               latency_ms, metadata, excerpt, prompt_hash, created_at
        FROM audit_events
        WHERE session_id = ?
        ORDER BY created_at ASC
        """,
        (session_id,),
    ).fetchall()
    return serialize_rows(rows)


def parse_window(window: str) -> timedelta:
    if window.endswith("h"):
        return timedelta(hours=int(window[:-1]))
    if window.endswith("d"):
        return timedelta(days=int(window[:-1]))
    return timedelta(hours=24)


def load_dashboard_metrics(window: str = "24h") -> dict:
    db = get_db()
    since = (datetime.now(timezone.utc) - parse_window(window)).isoformat()

    audit_rows = serialize_rows(
        db.execute(
            """
            SELECT *
            FROM audit_events
            WHERE created_at >= ?
            ORDER BY created_at DESC
            """,
            (since,),
        ).fetchall()
    )

    session_count = db.execute(
        "SELECT COUNT(*) AS count FROM chat_sessions WHERE updated_at >= ?",
        (since,),
    ).fetchone()["count"]

    total_events = len(audit_rows)
    decision_counter = Counter(row["allow_or_deny"] for row in audit_rows)
    allowed = decision_counter.get("allowed", 0) + decision_counter.get("success", 0)
    blocked = decision_counter.get("blocked", 0)
    review_required = decision_counter.get("review_required", 0)
    compliance = round((allowed / total_events) * 100, 1) if total_events else 100.0

    auth_rows = [row for row in audit_rows if row["action_type"] == "Authentication"]
    auth_by_hour = {}
    for row in auth_rows:
        hour = row["created_at"][11:13] + ":00"
        bucket = auth_by_hour.setdefault(hour, {"time": hour, "successful": 0, "failed": 0})
        if row["result_status"] == "success":
            bucket["successful"] += 1
        else:
            bucket["failed"] += 1
    authentication_activity = list(sorted(auth_by_hour.values(), key=lambda item: item["time"]))

    blocked_by_hour = {}
    for row in audit_rows:
        if row["allow_or_deny"] != "blocked":
            continue
        hour = row["created_at"][11:13] + ":00"
        bucket = blocked_by_hour.setdefault(hour, {"hour": hour, "threats": 0})
        bucket["threats"] += 1
    threat_timeline = list(sorted(blocked_by_hour.values(), key=lambda item: item["hour"]))

    recent_logs = [
        {
            "timestamp": row["created_at"],
            "user": row["user_email"],
            "action": row["action_type"],
            "status": row["result_status"],
            "details": row["policy_reason"],
            "requestId": row["request_id"],
        }
        for row in audit_rows[:8]
    ]

    blocked_rows = [row for row in audit_rows if row["allow_or_deny"] == "blocked"]
    critical_alert = None
    if blocked_rows:
        latest = blocked_rows[0]
        critical_alert = {
            "title": latest["action_type"],
            "message": latest["policy_reason"],
            "timestamp": latest["created_at"],
            "user": latest["user_email"],
        }

    return {
        "summaryCards": [
            {"label": "Active Sessions", "value": str(session_count), "detail": "Sessions active in window", "tone": "blue"},
            {"label": "Policy Compliance", "value": f"{compliance:.1f}%", "detail": "Allowed or successful outcomes", "tone": "green"},
            {"label": "Threats Blocked", "value": str(blocked), "detail": "Blocked during selected window", "tone": "red"},
            {"label": "Audit Events", "value": f"{total_events:,}", "detail": "Captured backend and policy events", "tone": "violet"},
        ],
        "authenticationActivity": authentication_activity,
        "policyEnforcement": [
            {"name": "Allowed", "value": allowed, "color": "#22c55e"},
            {"name": "Blocked", "value": blocked, "color": "#dc2626"},
            {"name": "Review Required", "value": review_required, "color": "#f97316"},
        ],
        "threatTimeline": threat_timeline,
        "criticalAlert": critical_alert,
        "recentAuditLogs": recent_logs,
    }
