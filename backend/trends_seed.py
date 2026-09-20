"""Seed TikTok Trend Intelligence pulses/clusters for Phase 1 (sample winners)."""
from datetime import datetime, timezone, timedelta

def _iso(hours_ago: float = 0) -> str:
    return (datetime.now(timezone.utc) - timedelta(hours=hours_ago)).isoformat()

AS_OF = _iso(2)

TIKTOK_PULSE = {
    "id": "pulse-tt-seed-001",
    "platform": "tiktok",
    "niche": "general",
    "fetched_at": AS_OF,
    "as_of": AS_OF,
    "videos": [
        {"id": "ttv1", "title": "3 numbers that killed my ad spend", "views": 2_400_000, "saves": 180_000},
        {"id": "ttv2", "title": "Day in the life: packing 40 orders", "views": 1_100_000, "saves": 92_000},
        {"id": "ttv3", "title": "Unpopular opinion: stop posting daily", "views": 890_000, "saves": 71_000},
        {"id": "ttv4", "title": "Before/after: same product, new hook", "views": 3_200_000, "saves": 240_000},
        {"id": "ttv5", "title": "POV: your FYP after this stitch", "views": 760_000, "saves": 55_000},
    ],
}

TIKTOK_CLUSTERS = [
    {
        "id": "cluster-tt-stat-shock",
        "pulse_id": "pulse-tt-seed-001",
        "platform": "tiktok",
        "angle_label": "Stat shock",
        "hook_archetype": "stat-shock",
        "member_video_ids": ["ttv1", "ttv4"],
        "why_working": {
            "hook_pattern": "Cold open with a concrete number in first 1.5s + on-screen text",
            "pacing_tells": "Cut every 1.2–1.8s; rewatch loop on the number reveal",
            "emotional_driver": "curiosity + mild outrage",
            "cta_loop": "End frame mirrors first frame number → native rewatch",
            "save_share_drivers": ["screenshot-worthy stat", "comment bait on methodology"],
            "evidence_ts": ["0:00", "0:02", "0:11"],
        },
        "drivers": {"saves": "high", "shares": "medium", "completion": "high"},
        "as_of": AS_OF,
    },
    {
        "id": "cluster-tt-day-in-life",
        "pulse_id": "pulse-tt-seed-001",
        "platform": "tiktok",
        "angle_label": "Day-in-the-life demo",
        "hook_archetype": "demonstration",
        "member_video_ids": ["ttv2"],
        "why_working": {
            "hook_pattern": "Immediate action shot — no intro talking head",
            "pacing_tells": "Montage with diegetic sound; text labels process steps",
            "emotional_driver": "aspiration",
            "cta_loop": "Soft follow CTA mid-pack, not end-card only",
            "save_share_drivers": ["process checklist", "niche-specific tools"],
            "evidence_ts": ["0:00", "0:05", "0:18"],
        },
        "drivers": {"saves": "high", "shares": "low", "completion": "medium"},
        "as_of": AS_OF,
    },
    {
        "id": "cluster-tt-contrarian",
        "pulse_id": "pulse-tt-seed-001",
        "platform": "tiktok",
        "angle_label": "Contrarian take",
        "hook_archetype": "contrarian",
        "member_video_ids": ["ttv3", "ttv5"],
        "why_working": {
            "hook_pattern": "Negation in first line ('Stop…') + face close-up",
            "pacing_tells": "Hold longer on face after claim, then rapid proof cuts",
            "emotional_driver": "outrage → validation",
            "cta_loop": "Stitch-friendly pause at claim",
            "save_share_drivers": ["debate comments", "duet bait"],
            "evidence_ts": ["0:00", "0:03", "0:09"],
        },
        "drivers": {"saves": "medium", "shares": "high", "completion": "medium"},
        "as_of": AS_OF,
    },
    {
        "id": "cluster-tt-before-after",
        "pulse_id": "pulse-tt-seed-001",
        "platform": "tiktok",
        "angle_label": "Before / after",
        "hook_archetype": "transformation",
        "member_video_ids": ["ttv4"],
        "why_working": {
            "hook_pattern": "Split reveal in first 2s; same product both sides",
            "pacing_tells": "Hard wipe at midpoint; audio swell on after",
            "emotional_driver": "fomo + pride",
            "cta_loop": "Replay-friendly wipe",
            "save_share_drivers": ["visual proof", "template reuse"],
            "evidence_ts": ["0:00", "0:08", "0:14"],
        },
        "drivers": {"saves": "high", "shares": "high", "completion": "high"},
        "as_of": AS_OF,
    },
]

PLATFORM_STUBS = {
    "youtube": {
        "lens": "Shorts search title + swipe-away; long-form retention later",
        "message": "YouTube Analyze engine coming — distinct Shorts rubric (not TikTok FYP).",
    },
    "instagram": {
        "lens": "Reels saves/shares, cover frame, carousel slide-one",
        "message": "Instagram Analyze engine coming — Reels-native Trends & scoring.",
    },
    "facebook": {
        "lens": "Mute-safe hook, shareability/groups, thruplay",
        "message": "Facebook Analyze engine coming — mute-safe + share rubric.",
    },
}
