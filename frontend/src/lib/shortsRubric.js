/** YouTube Shorts pre-flight rubric (Geneis v1 one-pager). Authoritative for youtube platform. */
export const SHORTS_FIELDS = [
  {
    id: "hook_strength",
    name: "Hook Strength (0–3s)",
    guidance: "Opening frame + first line create a clear curiosity or value promise — or they don’t.",
  },
  {
    id: "first_seconds",
    name: "First 1–3 Seconds (pattern interrupt)",
    guidance: "Motion + readable on-screen text work even on mute; no slow “hi guys” warmup.",
  },
  {
    id: "title_fit",
    name: "Title Fit",
    guidance: "Shorts title matches the hook and search intent; no bait-and-switch vs the open.",
  },
  {
    id: "cover_frame",
    name: "Cover Frame (thumbnail)",
    guidance: "Chosen cover is clear at phone size — subject + ≤5 words of text; not a blurry mid-gesture.",
  },
  {
    id: "retention_risk",
    name: "Retention Risk",
    guidance: "Payoff or escalate before the midpoint; no dead air, repeated beats, or late thesis.",
  },
  {
    id: "length_fit",
    name: "Length Fit (Shorts)",
    guidance: "One idea; prefer ~15–45s; anything past ~60s needs a hard reason or cut.",
  },
  {
    id: "audio_clarity",
    name: "Audio Clarity",
    guidance: "Voice intelligible on phone speaker; music doesn’t bury speech; no harsh peaks.",
  },
  {
    id: "onscreen_text_clarity",
    name: "On-Screen Text Clarity",
    guidance: "Captions/overlays readable; timed to speech; not a wall of text.",
  },
  {
    id: "cta_clarity",
    name: "CTA Clarity",
    guidance: "One clear next action before the end (follow / comment prompt / next Short) — not three competing asks.",
  },
  {
    id: "trend_angle_fit",
    name: "Trend Angle Fit",
    guidance: "Ties to a current format, topic, or audio naturally — or score N/A without penalty when evergreen-first.",
    optionalNa: true,
  },
];

export const SHORTS_SCORE_MAX = 5;

/** Weakest 2 scored fields (skip null/N/A). */
export function weakestTwo(components = []) {
  const scored = components.filter(
    (c) => c && c.score != null && c.score !== "N/A" && !Number.isNaN(Number(c.score)),
  );
  return [...scored].sort((a, b) => Number(a.score) - Number(b.score)).slice(0, 2);
}

export function isShortsPlatform(platform) {
  return (platform || "").toLowerCase() === "youtube";
}
