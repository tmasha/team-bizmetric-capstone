from __future__ import annotations

from copy import deepcopy


SYNTHETIC_RECORDS = {
    "demo": [
        {
            "id": "1001",
            "name": "Northwind Pilot Account",
            "status": "healthy",
            "owner": "ops-demo",
            "revenue": 210000,
            "summary": "Demo account used for non-production orchestration validation.",
        },
        {
            "id": "1002",
            "name": "Contoso Launch Sandbox",
            "status": "watch",
            "owner": "finance-demo",
            "revenue": 185000,
            "summary": "Synthetic sandbox that simulates launch-week monitoring.",
        },
        {
            "id": "1003",
            "name": "Fabrikam Read-Only Feed",
            "status": "healthy",
            "owner": "analytics-demo",
            "revenue": 264000,
            "summary": "Synthetic feed used to prove safe retrieval and dashboard reporting.",
        },
    ],
    "finance": [
        {
            "id": "2101",
            "name": "Quarterly Margin Review",
            "status": "healthy",
            "owner": "finance-ops",
            "revenue": 920000,
            "summary": "Synthetic finance record for variance and margin trend checks.",
        },
        {
            "id": "2102",
            "name": "AP Exception Queue",
            "status": "investigate",
            "owner": "finance-risk",
            "revenue": 402000,
            "summary": "Synthetic payable queue used for least-privilege export scenarios.",
        },
        {
            "id": "2103",
            "name": "Treasury Forecast Capsule",
            "status": "healthy",
            "owner": "treasury",
            "revenue": 1100000,
            "summary": "Synthetic treasury forecast record for read-only search and export tests.",
        },
    ],
    "ops": [
        {
            "id": "3201",
            "name": "Field Routing Cluster",
            "status": "healthy",
            "owner": "dispatch",
            "revenue": 315000,
            "summary": "Synthetic operations cluster supporting change-request workflows.",
        },
        {
            "id": "3202",
            "name": "Maintenance Escalation Queue",
            "status": "watch",
            "owner": "maintenance",
            "revenue": 188000,
            "summary": "Synthetic maintenance queue for approval and override drills.",
        },
        {
            "id": "3203",
            "name": "Region South Reliability Ring",
            "status": "investigate",
            "owner": "reliability",
            "revenue": 267000,
            "summary": "Synthetic reliability record used for cross-domain access checks.",
        },
    ],
    "hr": [
        {
            "id": "4301",
            "name": "Onboarding Workflow",
            "status": "healthy",
            "owner": "people-ops",
            "revenue": 0,
            "summary": "Synthetic HR process metadata with no real employee information.",
        },
        {
            "id": "4302",
            "name": "Training Completion Audit",
            "status": "watch",
            "owner": "learning",
            "revenue": 0,
            "summary": "Synthetic training compliance dataset for scoped policy tests.",
        },
        {
            "id": "4303",
            "name": "Talent Pipeline Snapshot",
            "status": "healthy",
            "owner": "recruiting",
            "revenue": 0,
            "summary": "Synthetic recruiting pipeline summary intended for read-only HR queries.",
        },
    ],
}


SYNTHETIC_DOCS = {
    "demo": [
        {
            "id": "doc-demo-001",
            "title": "Demo Data Governance Policy",
            "body": "Demo systems permit read-only retrieval, dashboard aggregation, and security testing with synthetic records.",
        },
        {
            "id": "doc-demo-002",
            "title": "Prompt Injection Handling",
            "body": "Requests that attempt to disable guardrails, reveal secrets, or bypass approval are blocked and audited.",
        },
    ],
    "finance": [
        {
            "id": "doc-fin-001",
            "title": "Finance Export Policy",
            "body": "Finance exports require analyst or admin role and return only row-limited synthetic data in the MVP.",
        },
        {
            "id": "doc-fin-002",
            "title": "Treasury Review Guidance",
            "body": "Treasury records are read-only for standard users and cannot be mass exported without policy approval.",
        },
    ],
    "ops": [
        {
            "id": "doc-ops-001",
            "title": "Change Request Workflow",
            "body": "Operational changes require explicit admin approval, audit logging, and a scoped summary of intended impact.",
        },
        {
            "id": "doc-ops-002",
            "title": "Override Escalation Process",
            "body": "Override approvals are always routed to human review in the secure control plane.",
        },
    ],
    "hr": [
        {
            "id": "doc-hr-001",
            "title": "HR Access Boundaries",
            "body": "HR records in the MVP contain only synthetic metadata and are never exportable by standard users.",
        },
        {
            "id": "doc-hr-002",
            "title": "People Ops Reporting",
            "body": "People Ops summaries are accessible only within the HR domain and remain subject to audit logging.",
        },
    ],
}


def list_records(domain: str, limit: int = 5) -> list[dict]:
    return deepcopy(SYNTHETIC_RECORDS.get(domain, [])[:limit])


def get_record(domain: str, record_id: str) -> dict | None:
    for record in SYNTHETIC_RECORDS.get(domain, []):
        if record["id"] == record_id:
            return deepcopy(record)
    return None


def search_docs(domain: str, query: str, limit: int = 3) -> list[dict]:
    lowered = query.lower().strip()
    results = []
    for document in SYNTHETIC_DOCS.get(domain, []):
        haystack = f"{document['title']} {document['body']}".lower()
        if lowered in haystack or not lowered:
            results.append(deepcopy(document))
        if len(results) >= limit:
            break
    return results


def export_rows(domain: str, limit: int = 3) -> list[dict]:
    return deepcopy(SYNTHETIC_RECORDS.get(domain, [])[:limit])
