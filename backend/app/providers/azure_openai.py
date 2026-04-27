from __future__ import annotations

from backend.app.providers.base import ChatProvider


class AzureOpenAIChatProvider(ChatProvider):
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
        raise NotImplementedError(
            "Azure OpenAI provider is intentionally stubbed until credentials and deployment details are available."
        )
