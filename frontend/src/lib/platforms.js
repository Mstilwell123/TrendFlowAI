/** Desktop platform menu bar — each is a distinct curation/scoring engine (§3c). */
export const PLATFORMS = [
  {
    id: "tiktok",
    label: "TikTok",
    status: "ready",
    lens: "FYP velocity, 0–3s hook, completion/rewatch, sound/trend fit",
  },
  {
    id: "youtube",
    label: "YouTube",
    status: "coming",
    lens: "Shorts: search title + swipe-away; Long-form later under this menu",
  },
  {
    id: "instagram",
    label: "Instagram",
    status: "coming",
    lens: "Reels saves/shares, cover frame, carousel slide-one",
  },
  {
    id: "facebook",
    label: "Facebook",
    status: "coming",
    lens: "Mute-safe hook, shareability/groups, thruplay",
  },
];

export const MODES = [
  { id: "study", label: "Study" },
  { id: "test", label: "Test" },
  { id: "trends", label: "Trends" },
];

export function getPlatform(id) {
  return PLATFORMS.find((p) => p.id === id) || PLATFORMS[0];
}
