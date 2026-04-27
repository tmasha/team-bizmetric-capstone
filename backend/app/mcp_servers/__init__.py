from __future__ import annotations

from backend.app.mcp_protocol import InProcessMCPClient
from backend.app.mcp_servers.business_read import create_business_read_server
from backend.app.mcp_servers.sensitive_action import create_sensitive_action_server


def build_mcp_clients() -> dict[str, InProcessMCPClient]:
    clients = {
        "business-read": InProcessMCPClient(create_business_read_server()),
        "sensitive-action": InProcessMCPClient(create_sensitive_action_server()),
    }
    for client in clients.values():
        client.initialize()
    return clients
