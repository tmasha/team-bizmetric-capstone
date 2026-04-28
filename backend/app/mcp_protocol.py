from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any, Callable
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


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


class RemoteMCPClient:
    def __init__(
        self,
        *,
        name: str,
        url: str,
        timeout_seconds: float = 20.0,
        shared_secret: str = "",
        headers: dict[str, str] | None = None,
    ):
        self.name = name
        self.url = url.rstrip("/")
        self.timeout_seconds = timeout_seconds
        self.shared_secret = shared_secret
        self.headers = headers or {}
        self.initialized = False
        self.server_info: dict[str, Any] = {}

    def _headers(self) -> dict[str, str]:
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            **self.headers,
        }
        if self.shared_secret:
            headers["x-mcp-shared-secret"] = self.shared_secret
        return headers

    def _post(self, payload: dict[str, Any]) -> dict[str, Any]:
        request = Request(
            self.url,
            data=json.dumps(payload).encode("utf-8"),
            headers=self._headers(),
            method="POST",
        )
        try:
            with urlopen(request, timeout=self.timeout_seconds) as response:
                raw = response.read().decode("utf-8")
        except HTTPError as error:
            detail = error.read().decode("utf-8", errors="replace")
            raise MCPProtocolError(
                f"Remote MCP server '{self.name}' returned HTTP {error.code}: {detail}"
            ) from error
        except URLError as error:
            raise MCPProtocolError(f"Remote MCP server '{self.name}' is unreachable: {error.reason}") from error

        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError as error:
            raise MCPProtocolError(f"Remote MCP server '{self.name}' returned invalid JSON.") from error

        if "error" in parsed:
            message = parsed["error"].get("message", "Unknown MCP error")
            raise MCPProtocolError(f"Remote MCP server '{self.name}' error: {message}")
        return parsed

    def initialize(self) -> dict[str, Any]:
        response = self._post({"jsonrpc": "2.0", "id": 1, "method": "initialize"})
        self.initialized = True
        self.server_info = response.get("result", {})
        return self.server_info

    def list_tools(self) -> list[dict[str, Any]]:
        if not self.initialized:
            self.initialize()
        response = self._post({"jsonrpc": "2.0", "id": 2, "method": "tools/list"})
        return response["result"]["tools"]

    def call_tool(self, name: str, arguments: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
        if not self.initialized:
            self.initialize()
        response = self._post(
            {
                "jsonrpc": "2.0",
                "id": 3,
                "method": "tools/call",
                "params": {"name": name, "arguments": arguments, "context": context},
            }
        )
        return response["result"]
