from __future__ import annotations

from backend.app.mcp_protocol import InProcessMCPServer, ToolDefinition
from backend.app.synthetic_data import get_record, list_records, search_docs


def create_business_read_server() -> InProcessMCPServer:
    def handle_list_records(arguments: dict, context: dict) -> dict:
        domain = context["domain"]
        limit = int(arguments.get("limit", 5))
        return {
            "server": "business-read",
            "tool": "list_records",
            "domain": domain,
            "records": list_records(domain, limit=limit),
        }

    def handle_get_record(arguments: dict, context: dict) -> dict:
        domain = context["domain"]
        record_id = str(arguments.get("recordId", "")).strip()
        record = get_record(domain, record_id)
        return {
            "server": "business-read",
            "tool": "get_record",
            "domain": domain,
            "record": record,
            "found": record is not None,
        }

    def handle_search_docs(arguments: dict, context: dict) -> dict:
        domain = context["domain"]
        query = str(arguments.get("query", "")).strip()
        limit = int(arguments.get("limit", 3))
        return {
            "server": "business-read",
            "tool": "search_docs",
            "domain": domain,
            "query": query,
            "documents": search_docs(domain, query=query, limit=limit),
        }

    return InProcessMCPServer(
        name="business-read",
        version="0.1.0",
        tools=[
            ToolDefinition(
                name="list_records",
                description="Return a limited list of synthetic business records for a domain.",
                input_schema={
                    "type": "object",
                    "properties": {"limit": {"type": "integer", "minimum": 1, "maximum": 10}},
                },
                handler=handle_list_records,
            ),
            ToolDefinition(
                name="get_record",
                description="Fetch a single synthetic record by its identifier.",
                input_schema={
                    "type": "object",
                    "properties": {"recordId": {"type": "string"}},
                    "required": ["recordId"],
                },
                handler=handle_get_record,
            ),
            ToolDefinition(
                name="search_docs",
                description="Search synthetic policy and documentation snippets within one domain.",
                input_schema={
                    "type": "object",
                    "properties": {
                        "query": {"type": "string"},
                        "limit": {"type": "integer", "minimum": 1, "maximum": 5},
                    },
                    "required": ["query"],
                },
                handler=handle_search_docs,
            ),
        ],
    )
