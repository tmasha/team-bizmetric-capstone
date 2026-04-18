from __future__ import annotations

from typing import Protocol


class ChatProvider(Protocol):
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
        ...
