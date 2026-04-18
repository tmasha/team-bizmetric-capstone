from __future__ import annotations

from backend.app.providers.base import ChatProvider


class MockChatProvider(ChatProvider):
    def build_reply(
        self,
        *,
        decision: str,
        requested_tool: str | None,
        tool_results: list[dict],
        policy_reason: str,
        domain: str,
        role: str,
    ) -> str:
        if decision == "blocked":
            return f"Request blocked by policy. {policy_reason}"

        if decision == "review_required":
            return (
                "This action requires human review before execution. "
                f"{policy_reason}"
            )

        if requested_tool and tool_results:
            result = tool_results[0]
            summary = result.get("summary")
            if summary:
                return summary

            structured = result.get("structuredContent", {})
            if requested_tool == "list_records":
                count = len(structured.get("records", []))
                return (
                    f"I securely retrieved {count} {domain} records for a {role} user. "
                    "The action was policy-approved and logged."
                )
            if requested_tool == "get_record":
                record = structured.get("record")
                if record:
                    return (
                        f"Record {record['id']} is available. "
                        f"Status: {record['status']}. Summary: {record['summary']}"
                    )
                return "No matching record was found in the approved domain scope."
            if requested_tool == "search_docs":
                documents = structured.get("documents", [])
                titles = ", ".join(document["title"] for document in documents) or "no matching documents"
                return f"I searched the approved documentation set and found: {titles}."
            if requested_tool == "submit_change":
                return (
                    "A synthetic change request was submitted successfully and written to the audit trail."
                )
            if requested_tool == "export_report":
                rows = structured.get("rows", [])
                return (
                    f"I exported a policy-limited report with {len(rows)} synthetic rows "
                    "and recorded the action for traceability."
                )

        return (
            "Request processed securely. No privileged tool execution was required, "
            "and the interaction was captured for compliance review."
        )
