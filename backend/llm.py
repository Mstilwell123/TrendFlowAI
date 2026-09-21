"""LLM pipeline: user BYOK keys first (perception + reason).

Product lock (§3d):
- Customer Study/Test traffic uses **per-user** encrypted keys — never shared
  Pragvance GEMINI_API_KEY / ANTHROPIC_API_KEY for production customer traffic.
- Dev escape hatch: ALLOW_DEV_SHARED_LLM_KEYS=true AND no user keys → env fallback
  (local smoke only; document as local-only).
- Provider auth/quota → "Your API key or quota failed"
- Missing keys → "Connect your AI keys in Settings"
"""
from __future__ import annotations

import os
import json
import re
import uuid
import logging
from dataclasses import dataclass
from typing import Dict, Any, List, Optional

from providers.base import (
    DEFAULTS,
    ProviderAuthError,
    ProviderQuotaError,
)
from providers.gemini import GeminiPerception
from providers.anthropic import AnthropicReason
from providers.xai import XAIReason
import crypto_keys

log = logging.getLogger("llm")

# Env fallbacks — LOCAL ONLY when ALLOW_DEV_SHARED_LLM_KEYS=true
_ENV_ANTHROPIC = os.environ.get("ANTHROPIC_API_KEY", "")
_ENV_GEMINI = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY", "")
_ENV_XAI = os.environ.get("XAI_API_KEY", "")

USER_FRIENDLY_KEY_ERROR = "Your API key or quota failed"
MISSING_KEYS_ERROR = "Connect your AI keys in Settings"


class MissingUserKeysError(Exception):
    """Raised when Study/Test needs keys but user has none (and no dev escape)."""

    def __init__(self, message: str = MISSING_KEYS_ERROR):
        super().__init__(message)


class UserProviderError(Exception):
    """Raised on provider auth/quota failures — message is user-safe."""

    def __init__(self, message: str = USER_FRIENDLY_KEY_ERROR):
        super().__init__(message)


@dataclass
class LLMCredentials:
    perception_provider: str
    perception_model: str
    perception_api_key: str
    reason_provider: str
    reason_model: str
    reason_api_key: str
    source: str  # "user" | "dev_shared"


def _allow_dev_shared() -> bool:
    return os.environ.get("ALLOW_DEV_SHARED_LLM_KEYS", "").lower() in ("1", "true", "yes")


def resolve_credentials(user: Optional[Dict[str, Any]]) -> LLMCredentials:
    """Resolve LLM credentials from user.ai_config (encrypted) or local-only env."""
    cfg = (user or {}).get("ai_config") or {}
    perception_provider = cfg.get("perception_provider") or DEFAULTS["perception_provider"]
    perception_model = cfg.get("perception_model") or DEFAULTS["perception_model"]
    reason_provider = cfg.get("reason_provider") or DEFAULTS["reason_provider"]
    reason_model = cfg.get("reason_model") or DEFAULTS["reason_model"]

    perception_key = ""
    reason_key = ""
    if cfg.get("perception_key_enc"):
        try:
            perception_key = crypto_keys.decrypt_key(cfg["perception_key_enc"])
        except Exception as e:
            log.warning(f"Failed to decrypt perception key: {e}")
    if cfg.get("reason_key_enc"):
        try:
            reason_key = crypto_keys.decrypt_key(cfg["reason_key_enc"])
        except Exception as e:
            log.warning(f"Failed to decrypt reason key: {e}")

    if perception_key and reason_key:
        return LLMCredentials(
            perception_provider=perception_provider,
            perception_model=perception_model,
            perception_api_key=perception_key,
            reason_provider=reason_provider,
            reason_model=reason_model,
            reason_api_key=reason_key,
            source="user",
        )

    if _allow_dev_shared():
        # Local smoke only — never the prod customer path
        env_perception = _ENV_GEMINI if perception_provider == "gemini" else _ENV_GEMINI
        if reason_provider == "anthropic":
            env_reason = _ENV_ANTHROPIC
        elif reason_provider == "xai":
            env_reason = _ENV_XAI or _ENV_ANTHROPIC
        else:
            env_reason = _ENV_ANTHROPIC
        if env_perception and env_reason:
            log.warning(
                "ALLOW_DEV_SHARED_LLM_KEYS: using shared env LLM keys (local-only escape hatch)"
            )
            return LLMCredentials(
                perception_provider=perception_provider,
                perception_model=perception_model,
                perception_api_key=env_perception,
                reason_provider=reason_provider,
                reason_model=reason_model,
                reason_api_key=env_reason,
                source="dev_shared",
            )

    raise MissingUserKeysError(MISSING_KEYS_ERROR)


def user_has_ai_keys(user: Optional[Dict[str, Any]]) -> bool:
    cfg = (user or {}).get("ai_config") or {}
    return bool(cfg.get("perception_key_enc") and cfg.get("reason_key_enc"))


def public_ai_config(user: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    cfg = (user or {}).get("ai_config") or {}
    return {
        "perception_provider": cfg.get("perception_provider") or DEFAULTS["perception_provider"],
        "perception_model": cfg.get("perception_model") or DEFAULTS["perception_model"],
        "reason_provider": cfg.get("reason_provider") or DEFAULTS["reason_provider"],
        "reason_model": cfg.get("reason_model") or DEFAULTS["reason_model"],
        "has_perception_key": bool(cfg.get("perception_key_enc")),
        "has_reason_key": bool(cfg.get("reason_key_enc")),
    }


def _wrap_provider_errors(fn):
    """Map provider auth/quota to UserProviderError with safe message."""
    async def _inner(*args, **kwargs):
        try:
            return await fn(*args, **kwargs)
        except (ProviderAuthError, ProviderQuotaError) as e:
            log.warning(f"Provider key/quota failure: {e}")
            raise UserProviderError(USER_FRIENDLY_KEY_ERROR) from e
        except UserProviderError:
            raise
        except MissingUserKeysError:
            raise
        except Exception as e:
            msg = str(e).lower()
            if any(x in msg for x in ("api key", "401", "403", "unauth", "invalid x-api-key",
                                       "quota", "rate limit", "429", "resource exhausted", "billing", "credit")):
                log.warning(f"Mapped provider-looking error: {e}")
                raise UserProviderError(USER_FRIENDLY_KEY_ERROR) from e
            raise
    return _inner


_gemini = GeminiPerception()
_anthropic = AnthropicReason()
_xai = XAIReason()


@_wrap_provider_errors
async def _perceive_call(creds: LLMCredentials, system: str, user_text: str, video_path: Optional[str] = None) -> str:
    if creds.perception_provider == "gemini":
        return await _gemini.perceive(
            api_key=creds.perception_api_key,
            model=creds.perception_model,
            system=system,
            user_text=user_text,
            video_path=video_path,
        )
    raise RuntimeError(f"Unsupported perception provider: {creds.perception_provider}")


@_wrap_provider_errors
async def _reason_call(creds: LLMCredentials, system: str, user_text: str) -> str:
    if creds.reason_provider == "anthropic":
        return await _anthropic.complete(
            api_key=creds.reason_api_key,
            model=creds.reason_model,
            system=system,
            user_text=user_text,
        )
    if creds.reason_provider == "xai":
        return await _xai.complete(
            api_key=creds.reason_api_key,
            model=creds.reason_model,
            system=system,
            user_text=user_text,
        )
    raise RuntimeError(f"Unsupported reason provider: {creds.reason_provider}")


PERCEPTION_SYSTEM = """You are a video perception engine. You will be given a short-form
video to watch (either as an attached video file, OR — when the file is unavailable — as
metadata only). Produce a STRUCTURED perception artifact a downstream reasoning model
can analyze. Do NOT copy verbatim transcript lines — paraphrase so we focus on structure.

You MUST return ONLY valid JSON matching this schema (no prose, no markdown fences):
{
  "duration_sec": int (8..120),
  "transcript": [{"t": "0:00", "text": "..."}, ...],
  "shots":      [{"t": "0:00", "description": "...", "on_screen_text": "...", "is_cut": bool}, ...],
  "audio":      {"description": "...", "track_name": null, "is_trending_sound": null},
  "summary":    "2-3 sentence description of the video's structural pattern"
}

Timestamps in MM:SS, evenly distributed across duration_sec.
"""

PERCEPTION_FALLBACK_SYSTEM = """You are a video perception engine. The actual video file
is NOT available — only metadata (URL, title, description, niche). Synthesize a PLAUSIBLE
structural breakdown that a senior creator would describe from watching it. Mark this as
a heuristic perception. Same JSON schema as the video-file path:
{
  "duration_sec": int (8..120),
  "transcript": [{"t": "0:00", "text": "..."}, ...],
  "shots":      [{"t": "0:00", "description": "...", "on_screen_text": "...", "is_cut": bool}, ...],
  "audio":      {"description": "...", "track_name": null, "is_trending_sound": null},
  "summary":    "2-3 sentence description (note: heuristic from metadata only)"
}
Return ONLY JSON. Timestamps in MM:SS evenly distributed across duration_sec.
"""

SCORECARD_SHORTS_SYSTEM = """You are a YouTube Shorts pre-flight coach.
Score the DRAFT Short across exactly these 10 fields using ONLY the perception artifact.
Each field score is an integer 1–5 (or null for trend_angle_fit when evergreen-first / N/A without penalty).
Cite evidence by timestamp (MM:SS). Be specific and honest. Shorts field names are authoritative.

Fields (id : guidance):
- hook_strength : Opening frame + first line create clear curiosity/value promise
- first_seconds : Motion + readable on-screen text work on mute; no slow hi-guys warmup
- title_fit : Shorts title matches hook + search intent; no bait-and-switch
- cover_frame : Cover clear at phone size — subject + ≤5 words; not blurry mid-gesture
- retention_risk : Payoff/escalate before midpoint; no dead air or late thesis
- length_fit : One idea; prefer ~15–45s; past ~60s needs hard reason
- audio_clarity : Voice intelligible on phone speaker; music doesn't bury speech
- onscreen_text_clarity : Captions/overlays readable; timed to speech; not a wall of text
- cta_clarity : One clear next action before end — not three competing asks
- trend_angle_fit : Ties to current format/topic/audio naturally — OR null/N/A with no penalty if evergreen-first

Also set detected_angle (short label) and platform_native_check: { "pass": bool, "note": "9:16 / safe zones / no letterbox" }.

Return ONLY JSON:
{
  "composite": int (0-100; map from average of scored 1-5 fields * 20),
  "rubric": "shorts_v1",
  "detected_angle": "short label",
  "platform_native_check": {"pass": true, "note": "..."},
  "components": [
    {"id": "hook_strength", "name": "Hook Strength (0–3s)", "score": int(1-5), "percentile_vs_niche": int(0-100), "evidence_ts": "MM:SS", "note": "1-2 sentence observation"},
    ... all 10 in order; trend_angle_fit score may be null ...
  ],
  "weakest_two": ["id1", "id2"],
  "summary": "2-3 sentence overall Shorts pre-flight read"
}
"""

SCORECARD_SYSTEM = """You are a senior short-form-video coach doing a PRE-FLIGHT check.
Score the draft across 10 components using ONLY the provided perception artifact.
Cite evidence by timestamp (MM:SS). Be specific, honest, and structural — judge the PATTERN,
not the personality. Benchmark mindset: how does this stack up against what is winning now?

Components (id : description):
- hook : First 3s grabs attention
- pacing : Cut rhythm & energy
- pattern_interrupt : Unexpected moments that re-hook
- emotional_driver : Curiosity / outrage / aspiration / fear / pride
- narrative_structure : Open-loop, problem-solution, listicle, story arc, etc.
- visual_composition : Framing, lighting, b-roll
- on_screen_text : Hierarchy, readability, reinforcement
- audio : Music choice, sound design, voice clarity
- authenticity : Feels human vs. canned
- cta : Loop or call-to-action

Also detect the draft's angle/hook archetype as detected_angle (short label).

Return ONLY JSON (no markdown):
{
  "composite": int (0-100),
  "outlier_multiplier": float,
  "detected_angle": "short angle label e.g. stat-shock demo",
  "components": [
    {"id": "hook", "name": "Hook (0-3s)", "score": int(0-10), "percentile_vs_niche": int(0-100), "evidence_ts": "MM:SS", "note": "1-2 sentence specific observation"},
    ... all 10 in order ...
  ],
  "summary": "2-3 sentence overall structural read"
}
"""

SCRIPTS_SYSTEM = """You are a short-form script engine. Using the perception artifact and
scorecard as the structural pattern (NEVER copying lines or text), generate 10 ORIGINAL,
ready-to-film scripts in the user's niche and brand voice. Each script must use a DISTINCT
hook archetype × format × emotional driver combination.

Hook archetypes (use 10 distinct): listicle, contrarian, prediction, confession, transformation, callout, question, stat-shock, demonstration, story-arc.
Formats: talking-head, voiceover-broll, screen-record, split-screen, montage, walk-and-talk.
Emotional drivers: curiosity, outrage, aspiration, fear, pride, fomo, validation.
Structures: open-loop, problem-solution, before-after, listicle-countdown, payoff-delayed.

Return ONLY JSON (no markdown):
{
  "scripts": [
    {
      "idx": 1,
      "hook_archetype": "...",
      "format": "...",
      "emotional_driver": "...",
      "structure": "...",
      "title": "short script title",
      "beats": [
        {"t": "0:00", "label": "Hook", "vo": "spoken line", "on_screen_text": "...", "shot": "shot direction", "audio": "audio direction"},
        ... 5-7 beats ending with a CTA/loop ...
      ]
    },
    ... 10 scripts total ...
  ]
}

CRITICAL: Honor brand voice tone and banned_phrases. No copying of the original video's lines.
"""

ALIGNMENT_SYSTEM = """You are a video coach doing a PRE-FLIGHT check. Given the user's draft
perception artifact and its scorecard, produce an Alignment Score and a Good/Bad/Ugly
breakdown with concrete fixes, each tied to a timestamp — before they publish.

Bands (legacy alignment labels; overall band uses loser/baseline/momentum/winner separately):
- 85-100: "Viral-ready"
- 70-84:  "Strong"
- 50-69:  "Promising"
- 30-49:  "Needs work"
- 0-29:   "Rework"

Return ONLY JSON (no markdown):
{
  "composite": int (0-100),
  "band": "string",
  "good": [{"component": "hook", "note": "what's working, with MM:SS"}],
  "bad":  [{"component": "pacing", "fix": "specific change to make, with MM:SS"}],
  "ugly": [{"component": "cta", "fix": "highest-leverage fix with MM:SS"}]
}
"""

TREND_COMPARE_SYSTEM = """You compare a creator's draft angle to currently winning trend clusters.
Return ONLY JSON:
{
  "matched_clusters": [{"cluster_id": "...", "angle_label": "...", "similarity": 0-100, "note": "..."}],
  "gaps": ["concrete gap vs winners", ...],
  "preflight_vs_winners": "2-4 sentence pre-flight summary: how this draft stacks up against today's winners"
}
Prefer winners/rising clusters — never flop-only benchmarking.
"""



def _extract_json(text: str) -> dict:
    if not text:
        raise ValueError("Empty LLM response")
    text = re.sub(r"^```(?:json)?\s*", "", text.strip(), flags=re.IGNORECASE | re.MULTILINE)
    text = re.sub(r"\s*```\s*$", "", text.strip(), flags=re.MULTILINE)
    start = text.find("{")
    end = text.rfind("}")
    if start < 0 or end < 0:
        raise ValueError(f"No JSON object in response: {text[:200]}")
    return json.loads(text[start : end + 1])


def _band_from_score(score: float) -> str:
    if score < 40:
        return "loser"
    if score < 60:
        return "baseline"
    if score < 80:
        return "momentum"
    return "winner"


async def _perceive_from_video(creds: LLMCredentials, video_path: str, niche: Optional[str]) -> Optional[Dict[str, Any]]:
    try:
        resp = await _perceive_call(
            creds,
            PERCEPTION_SYSTEM,
            f"Watch this short-form video (niche: {niche or 'general'}) and produce the perception artifact JSON.",
            video_path=video_path,
        )
        artifact = _extract_json(resp)
        artifact["_source"] = "video_file"
        return artifact
    except (UserProviderError, MissingUserKeysError):
        raise
    except Exception as e:
        log.warning(f"Real-video perception failed, falling back to heuristic: {e}")
        return None


async def _perceive_from_metadata(
    creds: LLMCredentials,
    video_url: Optional[str],
    title: Optional[str],
    description: Optional[str],
    platform: Optional[str],
    niche: Optional[str],
    duration_sec: Optional[int],
) -> Dict[str, Any]:
    payload = {
        "video_url": video_url or "(uploaded draft)",
        "platform": platform or "unknown",
        "title": title or "(no title provided)",
        "description": description or "(no description)",
        "niche": niche or "general",
        "estimated_duration_sec": duration_sec or 45,
    }
    resp = await _perceive_call(
        creds,
        PERCEPTION_FALLBACK_SYSTEM,
        f"Synthesize the perception artifact for this video:\n{json.dumps(payload, indent=2)}",
    )
    artifact = _extract_json(resp)
    artifact["_source"] = "metadata_heuristic"
    return artifact


async def run_perception(
    video_url: Optional[str],
    title: Optional[str],
    description: Optional[str],
    platform: Optional[str],
    niche: Optional[str],
    duration_sec: Optional[int],
    video_path: Optional[str] = None,
    creds: Optional[LLMCredentials] = None,
    user: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    c = creds or resolve_credentials(user)
    if video_path and os.path.exists(video_path):
        artifact = await _perceive_from_video(c, video_path, niche)
        if artifact:
            return artifact
    return await _perceive_from_metadata(c, video_url, title, description, platform, niche, duration_sec)


async def run_scorecard(
    perception: Dict[str, Any],
    niche: Optional[str],
    creds: Optional[LLMCredentials] = None,
    user: Optional[Dict[str, Any]] = None,
    platform: Optional[str] = None,
) -> Dict[str, Any]:
    c = creds or resolve_credentials(user)
    payload = {"niche": niche or "general", "perception": perception, "platform": platform or "tiktok"}
    system = SCORECARD_SHORTS_SYSTEM if (platform or "").lower() == "youtube" else SCORECARD_SYSTEM
    label = "Short" if (platform or "").lower() == "youtube" else "video"
    resp = await _reason_call(
        c,
        system,
        f"Score this {label}:\n{json.dumps(payload)[:8000]}",
    )
    data = _extract_json(resp)
    composite = float(data.get("composite") or 0)
    data["band"] = _band_from_score(composite)
    if (platform or "").lower() == "youtube":
        data.setdefault("rubric", "shorts_v1")
    return data


async def run_scripts(
    perception: Dict[str, Any],
    scorecard: Dict[str, Any],
    niche: Optional[str],
    brand_voice: Optional[Dict[str, Any]],
    creds: Optional[LLMCredentials] = None,
    user: Optional[Dict[str, Any]] = None,
) -> List[Dict[str, Any]]:
    c = creds or resolve_credentials(user)
    payload = {
        "niche": niche or "general",
        "brand_voice": brand_voice
        or {"tone": "confident, conversational", "banned_phrases": [], "sample_lines": []},
        "perception_summary": perception.get("summary", ""),
        "scorecard_summary": scorecard.get("summary", ""),
        "top_components": [x for x in scorecard.get("components", []) if x.get("score", 0) >= 7][:5],
    }
    resp = await _reason_call(
        c,
        SCRIPTS_SYSTEM,
        f"Generate 10 scripts honoring this brand:\n{json.dumps(payload)[:8000]}",
    )
    data = _extract_json(resp)
    scripts = data.get("scripts", [])
    for s in scripts:
        s["id"] = s.get("id") or str(uuid.uuid4())
    return scripts


async def run_alignment(
    perception: Dict[str, Any],
    scorecard: Dict[str, Any],
    creds: Optional[LLMCredentials] = None,
    user: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    c = creds or resolve_credentials(user)
    payload = {"perception_summary": perception.get("summary", ""), "scorecard": scorecard}
    resp = await _reason_call(
        c,
        ALIGNMENT_SYSTEM,
        f"Produce alignment:\n{json.dumps(payload)[:8000]}",
    )
    return _extract_json(resp)


async def run_trend_comparison(
    scorecard: Dict[str, Any],
    clusters: List[Dict[str, Any]],
    niche: Optional[str] = None,
    creds: Optional[LLMCredentials] = None,
    user: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Compare draft scorecard/angle against winning trend clusters (pre-flight)."""
    if not clusters:
        return {
            "matched_clusters": [],
            "gaps": ["No fresh trend clusters available — refresh Trends pulse."],
            "preflight_vs_winners": "Trend Intelligence pulse missing; scorecard stands alone.",
            "as_of": None,
        }

    # Prefer stub when we cannot resolve creds (e.g. Trends-only browse)
    try:
        c = creds or resolve_credentials(user)
    except MissingUserKeysError:
        angle = scorecard.get("detected_angle") or "unknown"
        top = clusters[:3]
        return {
            "matched_clusters": [
                {
                    "cluster_id": cl.get("id"),
                    "angle_label": cl.get("angle_label"),
                    "similarity": 70 - i * 10,
                    "note": f"Heuristic match to {cl.get('angle_label')} (stub — connect AI keys for live compare)",
                }
                for i, cl in enumerate(top)
            ],
            "gaps": [
                "Hook density likely below winning cluster median (stub)",
                "CTA/loop weaker than top rising angles (stub)",
            ],
            "preflight_vs_winners": (
                f"Draft angle '{angle}' compared to {len(top)} winning clusters (stub). "
                "Most tools sell post-mortem analysis. TrendFlow sells the pre-flight check."
            ),
            "as_of": top[0].get("as_of") if top else None,
            "_source": "stub",
        }

    payload = {
        "niche": niche or "general",
        "detected_angle": scorecard.get("detected_angle"),
        "composite": scorecard.get("composite"),
        "components": scorecard.get("components", [])[:10],
        "winning_clusters": [
            {
                "id": cl.get("id"),
                "angle_label": cl.get("angle_label"),
                "hook_archetype": cl.get("hook_archetype"),
                "why_working": cl.get("why_working"),
                "drivers": cl.get("drivers"),
            }
            for cl in clusters[:8]
        ],
    }
    resp = await _reason_call(
        c,
        TREND_COMPARE_SYSTEM,
        f"Pre-flight compare draft vs winners:\n{json.dumps(payload)[:10000]}",
    )
    data = _extract_json(resp)
    data["as_of"] = clusters[0].get("as_of") if clusters else None
    data["_source"] = c.reason_provider
    return data


# Back-compat aliases (tests / old call sites referencing module-level env)
ANTHROPIC_API_KEY = _ENV_ANTHROPIC
GEMINI_API_KEY = _ENV_GEMINI
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", DEFAULTS["perception_model"])
CLAUDE_MODEL = os.environ.get("CLAUDE_MODEL", DEFAULTS["reason_model"])
