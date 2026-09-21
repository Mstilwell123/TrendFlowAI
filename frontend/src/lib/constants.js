export const NICHES = [
  { id: "fitness", label: "Fitness" },
  { id: "real_estate", label: "Real Estate" },
  { id: "beauty", label: "Beauty" },
  { id: "finance", label: "Finance" },
  { id: "food", label: "Food" },
  { id: "fashion", label: "Fashion" },
  { id: "tech", label: "Tech" },
  { id: "travel", label: "Travel" },
  { id: "education", label: "Education" },
  { id: "comedy", label: "Comedy" },
  { id: "gaming", label: "Gaming" },
  { id: "parenting", label: "Parenting" },
  { id: "business", label: "Business" },
  { id: "music", label: "Music" },
  { id: "lifestyle", label: "Lifestyle" },
];

export const COMPONENTS = [
  { id: "hook", name: "Hook (0-3s)", weight: 0.18 },
  { id: "pacing", name: "Pacing & Cuts", weight: 0.10 },
  { id: "pattern_interrupt", name: "Pattern Interrupts", weight: 0.08 },
  { id: "emotional_driver", name: "Emotional Driver", weight: 0.10 },
  { id: "narrative_structure", name: "Narrative Structure", weight: 0.12 },
  { id: "visual_composition", name: "Visual Composition", weight: 0.08 },
  { id: "on_screen_text", name: "On-Screen Text", weight: 0.08 },
  { id: "audio", name: "Audio / Sound", weight: 0.10 },
  { id: "authenticity", name: "Authenticity", weight: 0.08 },
  { id: "cta", name: "CTA & Loop", weight: 0.08 },
];

import { TIERS as PRICING_TIERS } from "./pricing";

// Legacy alias for components that haven't migrated to the new pricing.js schema yet.
// New schema fields: monthly, annual, credits, credits_label, audience, cta.
// Legacy fields: price (= monthly), highlighted.
export const TIERS = PRICING_TIERS.map((t) => ({ ...t, price: t.monthly }));

export const STATUS_LABELS = {
  queued: "Queued",
  downloading: "Downloading video",
  perceiving: "Perceiving video",
  analyzing: "Scoring components",
  generating: "Generating outputs",
  done: "Done",
  failed: "Failed",
};
