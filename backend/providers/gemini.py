"""Gemini perception adapter (BYOK stub — callable)."""
from __future__ import annotations

import asyncio
import os
from typing import Optional

from .base import ProviderAuthError, ProviderQuotaError


class GeminiPerception:
    provider_id = "gemini"
    default_model = "gemini-2.0-flash"

    async def perceive(
        self,
        *,
        api_key: str,
        model: str,
        system: str,
        user_text: str,
        video_path: Optional[str] = None,
    ) -> str:
        if not api_key:
            raise ProviderAuthError("Gemini API key missing")

        def _call() -> str:
            try:
                import google.generativeai as genai
            except ImportError as e:
                raise RuntimeError("google-generativeai not installed") from e

            try:
                genai.configure(api_key=api_key)
                m = genai.GenerativeModel(model or self.default_model, system_instruction=system)
                contents: list = []
                uploaded = None
                try:
                    if video_path and os.path.exists(video_path):
                        uploaded = genai.upload_file(path=video_path, mime_type="video/mp4")
                        import time
                        for _ in range(30):
                            meta = genai.get_file(uploaded.name)
                            if meta.state.name == "ACTIVE":
                                break
                            if meta.state.name == "FAILED":
                                raise RuntimeError("Gemini file upload failed")
                            time.sleep(1)
                        contents.append(uploaded)
                    contents.append(user_text)
                    resp = m.generate_content(contents)
                    return resp.text or ""
                finally:
                    if uploaded is not None:
                        try:
                            genai.delete_file(uploaded.name)
                        except Exception:
                            pass
            except Exception as e:
                msg = str(e).lower()
                if any(x in msg for x in ("api key", "permission", "401", "403", "unauth", "invalid")):
                    raise ProviderAuthError(str(e)) from e
                if any(x in msg for x in ("quota", "rate", "429", "resource exhausted", "billing")):
                    raise ProviderQuotaError(str(e)) from e
                raise

        return await asyncio.to_thread(_call)
