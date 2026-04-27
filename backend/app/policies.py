from __future__ import annotations

import re
from dataclasses import dataclass


DOMAINS = ("demo", "finance", "ops", "hr")
ROLE_PRIORITY = {"admin": 3, "security_analyst": 2, "user": 1}

TOOL_RULES = {
    "list_records": {
        "server": "business-read",
        "description": "List approved records within one domain.",
        "roles": {"user", "security_analyst", "admin"},
        "domains": set(DOMAINS),
        "always_review": False,
        "action_type": "Query Executed",
    },
    "get_record": {
        "server": "business-read",
        "description": "Retrieve one approved record within one domain.",
        "roles": {"user", "security_analyst", "admin"},
        "domains": set(DOMAINS),
        "always_review": False,
        "action_type": "Record Lookup",
    },
    "search_docs": {
        "server": "business-read",
        "description": "Search approved documentation within one domain.",
        "roles": {"user", "security_analyst", "admin"},
        "domains": set(DOMAINS),
        "always_review": False,
        "action_type": "Document Search",
    },
    "submit_change": {
        "server": "sensitive-action",
        "description": "Submit a privileged change request.",
        "roles": {"admin"},
        "domains": {"demo", "ops"},
        "always_review": False,
        "action_type": "Change Request",
    },
    "export_report": {
        "server": "sensitive-action",
        "description": "Export a row-limited sensitive report.",
        "roles": {"security_analyst", "admin"},
        "domains": set(DOMAINS),
        "always_review": False,
        "action_type": "Report Export",
    },
    "approve_override": {
        "server": "sensitive-action",
        "description": "Approve an override request. Always human reviewed.",
        "roles": {"admin"},
        "domains": set(DOMAINS),
        "always_review": True,
        "action_type": "Override Approval",
    },
}

PROMPT_ATTACK_MARKERS = (
    "ignore previous",
    "ignore all previous",
    "bypass policy",
    "disable guardrails",
    "reveal secrets",
    "show system prompt",
    "print hidden instructions",
    "elevate my access",
    "become admin",
    "dump the database",
    "exfiltrate data",
)


@dataclass
class Intent:
    requested_tool: str | None
    arguments: dict
    policy_flags: list[str]
    reason: str
    requested_domain: str | None = None


def resolve_primary_role(roles: list[str]) -> str:
    normalized = [role for role in roles if role in ROLE_PRIORITY]
    if not normalized:
        return "user"
    return sorted(normalized, key=lambda role: ROLE_PRIORITY[role], reverse=True)[0]


def analyze_message(message: str, domain: str) -> Intent:
    lowered = message.lower()

    for marker in PROMPT_ATTACK_MARKERS:
        if marker in lowered:
            return Intent(
                requested_tool=None,
                arguments={},
                policy_flags=["prompt_injection"],
                reason=f"Prompt injection marker detected: '{marker}'.",
            )

    mentioned_domains = [candidate for candidate in DOMAINS if candidate in lowered and candidate != domain]
    if mentioned_domains:
        return Intent(
            requested_tool=None,
            arguments={},
            policy_flags=["cross_domain_request"],
            reason=f"Cross-domain request detected for '{mentioned_domains[0]}' while scoped to '{domain}'.",
            requested_domain=mentioned_domains[0],
        )

    record_match = re.search(r"(?:record|account|ticket)[^\d]*(\d{3,})", lowered)

    if "approve" in lowered and "override" in lowered:
        return Intent(
            requested_tool="approve_override",
            arguments={"reason": message[:180]},
            policy_flags=[],
            reason="Override approval requested.",
        )

    if ("submit" in lowered or "apply" in lowered or "update" in lowered or "modify" in lowered) and "change" in lowered:
        return Intent(
            requested_tool="submit_change",
            arguments={"summary": message[:180]},
            policy_flags=[],
            reason="Privileged change submission requested.",
        )

    if "export" in lowered and "report" in lowered:
        return Intent(
            requested_tool="export_report",
            arguments={"limit": 3},
            policy_flags=[],
            reason="Report export requested.",
        )

    if record_match:
        return Intent(
            requested_tool="get_record",
            arguments={"recordId": record_match.group(1)},
            policy_flags=[],
            reason=f"Record lookup requested for {record_match.group(1)}.",
        )

    if "search" in lowered and any(keyword in lowered for keyword in ("doc", "policy", "document")):
        query = message.split("search", 1)[-1].strip() if "search" in lowered else message
        return Intent(
            requested_tool="search_docs",
            arguments={"query": query or message, "limit": 3},
            policy_flags=[],
            reason="Documentation search requested.",
        )

    if any(keyword in lowered for keyword in ("list records", "show records", "list accounts", "show data", "list data")):
        return Intent(
            requested_tool="list_records",
            arguments={"limit": 5},
            policy_flags=[],
            reason="Record listing requested.",
        )

    return Intent(
        requested_tool=None,
        arguments={},
        policy_flags=[],
        reason="No tool required.",
    )


def list_tool_access(roles: list[str], domain: str) -> dict[str, list[dict]]:
    allowed = []
    restricted = []
    role_set = set(roles)
    for tool_name, rule in TOOL_RULES.items():
        item = {
            "name": tool_name,
            "server": rule["server"],
            "description": rule["description"],
        }
        if domain not in rule["domains"]:
            restricted.append({**item, "reason": f"Unavailable in the {domain} domain."})
        elif not role_set.intersection(rule["roles"]):
            restricted.append({**item, "reason": f"Requires one of: {', '.join(sorted(rule['roles']))}."})
        elif rule["always_review"]:
            restricted.append({**item, "reason": "Always routed to human review."})
        else:
            allowed.append(item)
    return {"allowedTools": allowed, "restrictedTools": restricted}


def evaluate_policy(roles: list[str], domain: str, intent: Intent) -> tuple[str, str]:
    role_set = set(roles)

    if "prompt_injection" in intent.policy_flags:
        return "blocked", intent.reason

    if "cross_domain_request" in intent.policy_flags:
        return "blocked", intent.reason

    if not intent.requested_tool:
        return "allowed", intent.reason

    rule = TOOL_RULES[intent.requested_tool]

    if domain not in rule["domains"]:
        return "blocked", f"{intent.requested_tool} is not available in the {domain} domain."

    if rule["always_review"]:
        return "review_required", f"{intent.requested_tool} always requires human oversight."

    if not role_set.intersection(rule["roles"]):
        needed = ", ".join(sorted(rule["roles"]))
        return "blocked", f"{intent.requested_tool} requires role: {needed}."

    return "allowed", intent.reason
