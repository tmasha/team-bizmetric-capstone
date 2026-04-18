from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable


class MCPProtocolError(Exception):
    pass


@dataclass
class ToolDefinition:
    name: str
    description: str
    input_schema: dict[str, Any]
    handler: Callable[[dict[str, Any], dict[str, Any]], dict[str, Any]]

    def as_mcp_tool(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "description": self.description,
            "inputSchema": self.input_schema,
        }


class InProcessMCPServer:
    protocol_version = "2025-11-05"

    def __init__(self, name: str, version: str, tools: list[ToolDefinition]):
        self.name = name
        self.version = version
        self.tools = {tool.name: tool for tool in tools}

    def handle_request(self, payload: dict[str, Any], context: dict[str, Any] | None = None) -> dict[str, Any]:
        method = payload.get("method")
        params = payload.get("params", {})
        request_id = payload.get("id")
        context = context or {}

        if method == "initialize":
            result = {
                "protocolVersion": self.protocol_version,
                "capabilities": {"tools": {}},
                "serverInfo": {"name": self.name, "version": self.version},
            }
        elif method == "tools/list":
            result = {"tools": [tool.as_mcp_tool() for tool in self.tools.values()]}
        elif method == "tools/call":
            tool_name = params.get("name")
            arguments = params.get("arguments", {})
            if tool_name not in self.tools:
                raise MCPProtocolError(f"Unknown tool: {tool_name}")
            output = self.tools[tool_name].handler(arguments, context)
            result = {
                "content": [{"type": "text", "text": str(output)}],
                "structuredContent": output,
                "isError": False,
            }
        else:
            raise MCPProtocolError(f"Unsupported MCP method: {method}")

        return {"jsonrpc": "2.0", "id": request_id, "result": result}


class InProcessMCPClient:
    def __init__(self, server: InProcessMCPServer):
        self.server = server
        self.initialized = False

    def initialize(self) -> dict[str, Any]:
        response = self.server.handle_request({"jsonrpc": "2.0", "id": 1, "method": "initialize"})
        self.initialized = True
        return response["result"]

    def list_tools(self) -> list[dict[str, Any]]:
        if not self.initialized:
            self.initialize()
        response = self.server.handle_request({"jsonrpc": "2.0", "id": 2, "method": "tools/list"})
        return response["result"]["tools"]

    def call_tool(self, name: str, arguments: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
        if not self.initialized:
            self.initialize()
        response = self.server.handle_request(
            {
                "jsonrpc": "2.0",
                "id": 3,
                "method": "tools/call",
                "params": {"name": name, "arguments": arguments},
            },
            context=context,
        )
        return response["result"]
