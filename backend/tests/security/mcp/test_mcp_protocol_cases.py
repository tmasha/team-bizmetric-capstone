from backend.app.mcp_protocol import MCPProtocolError
from backend.app.mcp_servers import build_mcp_clients
from backend.tests.helpers import BackendTestCase


class MCPSecurityTests(BackendTestCase):
    def test_business_server_lists_expected_tools(self):
        clients = build_mcp_clients()
        tools = clients["business-read"].list_tools()
        tool_names = {tool["name"] for tool in tools}
        self.assertIn("list_records", tool_names)
        self.assertIn("search_docs", tool_names)

    def test_unknown_tool_raises_protocol_error(self):
        clients = build_mcp_clients()
        with self.assertRaises(MCPProtocolError):
            clients["business-read"].server.handle_request(
                {
                    "jsonrpc": "2.0",
                    "id": 99,
                    "method": "tools/call",
                    "params": {"name": "poisoned_tool", "arguments": {}},
                },
                context={"domain": "demo"},
            )
