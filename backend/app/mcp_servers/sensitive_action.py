from __future__ import annotations

from uuid import uuid4

from backend.app.mcp_protocol import InProcessMCPServer, ToolDefinition
from backend.app.synthetic_data import export_rows


def create_sensitive_action_server() -> InProcessMCPServer:
    def handle_submit_change(arguments: dict, context: dict) -> dict:
        return {
            "server": "sensitive-action",
            "tool": "submit_change",
            "domain": context["domain"],
            "changeRequestId": f"chg-{uuid4().hex[:8]}",
            "summary": str(arguments.get("summary", "")).strip(),
            "status": "submitted",
        }

    def handle_export_report(arguments: dict, context: dict) -> dict:
        limit = min(int(arguments.get("limit", 3)), 3)
        return {
            "server": "sensitive-action",
            "tool": "export_report",
            "domain": context["domain"],
            "rowLimitApplied": limit,
            "rows": export_rows(context["domain"], limit=limit),
            "status": "exported",
        }

    def handle_approve_override(arguments: dict, context: dict) -> dict:
        return {
            "server": "sensitive-action",
            "tool": "approve_override",
            "domain": context["domain"],
            "status": "review_required",
            "reason": str(arguments.get("reason", "")).strip(),
        }

    return InProcessMCPServer(
        name="sensitive-action",
        version="0.1.0",
        tools=[
            ToolDefinition(
                name="submit_change",
                description="Submit a synthetic operational change request.",
                input_schema={
                    "type": "object",
                    "properties": {"summary": {"type": "string"}},
                    "required": ["summary"],
                },
                handler=handle_submit_change,
            ),
            ToolDefinition(
                name="export_report",
                description="Export a row-limited synthetic report for the current domain.",
                input_schema={
                    "type": "object",
                    "properties": {"limit": {"type": "integer", "minimum": 1, "maximum": 3}},
                },
                handler=handle_export_report,
            ),
            ToolDefinition(
                name="approve_override",
                description="Request override approval. This tool is always review-gated.",
                input_schema={
                    "type": "object",
                    "properties": {"reason": {"type": "string"}},
                },
                handler=handle_approve_override,
            ),
        ],
    )
