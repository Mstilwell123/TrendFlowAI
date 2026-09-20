"""LLM pipeline: Gemini for perception, Claude for reason/scorecard/scripts.
No Emergent SDK — uses ANTHROPIC_API_KEY + GEMINI_API_KEY (or GOOGLE_API_KEY).
"""
import os
import json
import re
import uuid
import asyncio
import logging
from typing import Dict, Any, List, Optional

log = logging.getLogger("llm")

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY", "")

GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")
CLAUDE_MODEL = os.environ.get("CLAUDE_MODEL", "claude-sonnet-4-20250514")

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


async def _claude(system: str, user_text: str) -> str:
    if not ANTHROPIC_API_KEY:
        raise RuntimeError("ANTHROPIC_API_KEY is not set")
    import anthropic

    def _call():
        client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
        msg = client.messages.create(
            model=CLAUDE_MODEL,
            max_tokens=8192,
            system=system,
            messages=[{"role": "user", "content": user_text}],
        )
        parts = []
        for block in msg.content:
            if hasattr(block, "text"):
                parts.append(block.text)
        return "".join(parts)

    return await asyncio.to_thread(_call)


async def _gemini(system: str, user_text: str, video_path: Optional[str] = None) -> str:
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY or GOOGLE_API_KEY is not set")

    def _call():
        import google.generativeai as genai

        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel(GEMINI_MODEL, system_instruction=system)
        contents: list = []
        uploaded = None
        try:
            if video_path and os.path.exists(video_path):
                uploaded = genai.upload_file(path=video_path, mime_type="video/mp4")
                # Wait briefly for processing
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
            resp = model.generate_content(contents)
            return resp.text or ""
        finally:
            if uploaded is not None:
                try:
                    genai.delete_file(uploaded.name)
                except Exception:
                    pass

    return await asyncio.to_thread(_call)


async def _perceive_from_video(video_path: str, niche: Optional[str]) -> Optional[Dict[str, Any]]:
    try:
        resp = await _gemini(
            PERCEPTION_SYSTEM,
            f"Watch this short-form video (niche: {niche or 'general'}) and produce the perception artifact JSON.",
            video_path=video_path,
        )
        artifact = _extract_json(resp)
        artifact["_source"] = "video_file"
        return artifact
    except Exception as e:
        log.warning(f"Real-video perception failed, falling back to heuristic: {e}")
        return None


async def _perceive_from_metadata(
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
    resp = await _gemini(
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
) -> Dict[str, Any]:
    if video_path and os.path.exists(video_path):
        artifact = await _perceive_from_video(video_path, niche)
        if artifact:
            return artifact
    return await _perceive_from_metadata(video_url, title, description, platform, niche, duration_sec)


async def run_scorecard(perception: Dict[str, Any], niche: Optional[str]) -> Dict[str, Any]:
    payload = {"niche": niche or "general", "perception": perception}
    resp = await _claude(
        SCORECARD_SYSTEM,
        f"Score this video:\n{json.dumps(payload)[:8000]}",
    )
    data = _extract_json(resp)
    composite = float(data.get("composite") or 0)
    data["band"] = _band_from_score(composite)
    return data


async def run_scripts(
    perception: Dict[str, Any],
    scorecard: Dict[str, Any],
    niche: Optional[str],
    brand_voice: Optional[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    payload = {
        "niche": niche or "general",
        "brand_voice": brand_voice
        or {"tone": "confident, conversational", "banned_phrases": [], "sample_lines": []},
        "perception_summary": perception.get("summary", ""),
        "scorecard_summary": scorecard.get("summary", ""),
        "top_components": [c for c in scorecard.get("components", []) if c.get("score", 0) >= 7][:5],
    }
    resp = await _claude(
        SCRIPTS_SYSTEM,
        f"Generate 10 scripts honoring this brand:\n{json.dumps(payload)[:8000]}",
    )
    data = _extract_json(resp)
    scripts = data.get("scripts", [])
    for s in scripts:
        s["id"] = s.get("id") or str(uuid.uuid4())
    return scripts


async def run_alignment(perception: Dict[str, Any], scorecard: Dict[str, Any]) -> Dict[str, Any]:
    payload = {"perception_summary": perception.get("summary", ""), "scorecard": scorecard}
    resp = await _claude(
        ALIGNMENT_SYSTEM,
        f"Produce alignment:\n{json.dumps(payload)[:8000]}",
    )
    return _extract_json(resp)


async def run_trend_comparison(
    scorecard: Dict[str, Any],
    clusters: List[Dict[str, Any]],
    niche: Optional[str] = None,
) -> Dict[str, Any]:
    """Compare draft scorecard/angle against winning trend clusters (pre-flight)."""
    if not clusters:
        return {
            "matched_clusters": [],
            "gaps": ["No fresh trend clusters available — refresh Trends pulse."],
            "preflight_vs_winners": "Trend Intelligence pulse missing; scorecard stands alone.",
            "as_of": None,
        }
    # Prefer stub path when no API key (CI / local without keys)
    if not ANTHROPIC_API_KEY:
        angle = scorecard.get("detected_angle") or "unknown"
        top = clusters[:3]
        return {
            "matched_clusters": [
                {
                    "cluster_id": c.get("id"),
                    "angle_label": c.get("angle_label"),
                    "similarity": 70 - i * 10,
                    "note": f"Heuristic match to {c.get('angle_label')} (stub — set ANTHROPIC_API_KEY for live compare)",
                }
                for i, c in enumerate(top)
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
                "id": c.get("id"),
                "angle_label": c.get("angle_label"),
                "hook_archetype": c.get("hook_archetype"),
                "why_working": c.get("why_working"),
                "drivers": c.get("drivers"),
            }
            for c in clusters[:8]
        ],
    }
    resp = await _claude(
        TREND_COMPARE_SYSTEM,
        f"Pre-flight compare draft vs winners:\n{json.dumps(payload)[:10000]}",
    )
    data = _extract_json(resp)
    data["as_of"] = clusters[0].get("as_of") if clusters else None
    data["_source"] = "claude"
    return data
