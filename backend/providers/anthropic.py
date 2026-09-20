"""Anthropic Claude reason adapter (BYOK stub — callable)."""
from __future__ import annotations

import asyncio

from .base import ProviderAuthError, ProviderQuotaError


class AnthropicReason:
    provider_id = "anthropic"
    default_model = "claude-sonnet-4-20250514"

    async def complete(
        self,
        *,
        api_key: str,
        model: str,
        system: str,
        user_text: str,
        max_tokens: int = 8192,
    ) -> str:
        if not api_key:
            raise ProviderAuthError("Anthropic API key missing")

        def _call() -> str:
            try:
                import anthropic
            except ImportError as e:
                raise RuntimeError("anthropic package not installed") from e

            try:
                client = anthropic.Anthropic(api_key=api_key)
                msg = client.messages.create(
                    model=model or self.default_model,
                    max_tokens=max_tokens,
                    system=system,
                    messages=[{"role": "user", "content": user_text}],
                )
                parts = []
                for block in msg.content:
                    if hasattr(block, "text"):
                        parts.append(block.text)
                return "".join(parts)
            except Exception as e:
                msg = str(e).lower()
                err_type = type(e).__name__.lower()
                if "authentication" in err_type or any(
                    x in msg for x in ("api key", "401", "403", "unauth", "invalid", "authentication")
                ):
                    raise ProviderAuthError(str(e)) from e
                if any(x in msg for x in ("quota", "rate", "429", "overloaded", "billing", "credit")):
                    raise ProviderQuotaError(str(e)) from e
                raise

        return await asyncio.to_thread(_call)
