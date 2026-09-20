"""xAI Grok reason adapter (BYOK scaffold — OpenAI-compatible HTTP)."""
from __future__ import annotations

import asyncio

from .base import ProviderAuthError, ProviderQuotaError

XAI_BASE_URL = "https://api.x.ai/v1"


class XAIReason:
    provider_id = "xai"
    default_model = "grok-2-latest"

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
            raise ProviderAuthError("xAI API key missing")

        def _call() -> str:
            try:
                import httpx
            except ImportError as e:
                raise RuntimeError("httpx not installed") from e

            try:
                with httpx.Client(timeout=120.0) as client:
                    r = client.post(
                        f"{XAI_BASE_URL}/chat/completions",
                        headers={
                            "Authorization": f"Bearer {api_key}",
                            "Content-Type": "application/json",
                        },
                        json={
                            "model": model or self.default_model,
                            "max_tokens": max_tokens,
                            "messages": [
                                {"role": "system", "content": system},
                                {"role": "user", "content": user_text},
                            ],
                        },
                    )
                if r.status_code in (401, 403):
                    raise ProviderAuthError(r.text[:300])
                if r.status_code == 429:
                    raise ProviderQuotaError(r.text[:300])
                if r.status_code >= 400:
                    body = r.text.lower()
                    if any(x in body for x in ("quota", "billing", "credit", "rate")):
                        raise ProviderQuotaError(r.text[:300])
                    if any(x in body for x in ("api key", "auth", "unauth")):
                        raise ProviderAuthError(r.text[:300])
                    r.raise_for_status()
                data = r.json()
                return data["choices"][0]["message"]["content"] or ""
            except (ProviderAuthError, ProviderQuotaError):
                raise
            except Exception as e:
                msg = str(e).lower()
                if any(x in msg for x in ("api key", "401", "403", "unauth")):
                    raise ProviderAuthError(str(e)) from e
                if any(x in msg for x in ("quota", "rate", "429", "billing")):
                    raise ProviderQuotaError(str(e)) from e
                raise

        return await asyncio.to_thread(_call)
