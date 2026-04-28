from __future__ import annotations

from backend.app.mcp_protocol import InProcessMCPClient, RemoteMCPClient
from backend.app.mcp_servers.business_read import create_business_read_server
from backend.app.mcp_servers.sensitive_action import create_sensitive_action_server


def _coerce_server_config(config: dict | None, key: str, fallback_url: str) -> dict:
    item = config.get(key, {}) if isinstance(config, dict) else {}
    if isinstance(item, str):
        item = {"url": item}
    item = dict(item)
    if fallback_url and "url" not in item:
        item["url"] = fallback_url
    return item


def build_mcp_clients(config: dict | None = None) -> dict[str, InProcessMCPClient | RemoteMCPClient]:
    config = config or {}
    if config.get("MCP_TRANSPORT", "inprocess") == "remote":
        server_config = config.get("MCP_SERVER_CONFIG", {})
        shared_secret = config.get("MCP_SHARED_SECRET", "")
        timeout_seconds = float(config.get("MCP_TIMEOUT_SECONDS", 20))

        resolved = {
            "business-read": _coerce_server_config(
                server_config,
                "business-read",
                config.get("MCP_BUSINESS_READ_URL", ""),
            ),
            "sensitive-action": _coerce_server_config(
                server_config,
                "sensitive-action",
                config.get("MCP_SENSITIVE_ACTION_URL", ""),
            ),
        }

        clients = {}
        for name, item in resolved.items():
            url = item.get("url", "").strip()
            if not url:
                raise ValueError(f"Missing MCP URL for remote server '{name}'.")
            clients[name] = RemoteMCPClient(
                name=name,
                url=url,
                timeout_seconds=timeout_seconds,
                shared_secret=item.get("sharedSecret", shared_secret),
                headers=item.get("headers"),
            )
        return clients

    clients = {
        "business-read": InProcessMCPClient(create_business_read_server()),
        "sensitive-action": InProcessMCPClient(create_sensitive_action_server()),
    }
    for client in clients.values():
        client.initialize()
    return clients
