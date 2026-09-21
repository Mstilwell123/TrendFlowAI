// Pricing / billing config — single source of truth for the frontend.
// Mirrors backend models.TIERS. Backend credit metering is wired in a separate workstream.

export const TIERS = [
  {
    id: "free", name: "Free",
    tagline: "Try the engine.",
    monthly: 0,
    annual: 0,
    credits: 3,
    credits_label: "3 videos lifetime",
    audience: "Aspiring creator",
    features: [
      "3 video analyses (lifetime)",
      "Full 10-component teardown",
      "Vault (basic)",
      "Public shareable reports",
    ],
    cta: "Start free",
    highlighted: false,
  },
  {
    id: "creator", name: "Creator",
    tagline: "Ship more, guess less.",
    monthly: 29,
    annual: 19,
    credits: 17,
    credits_label: "17 videos / month",
    audience: "Serious part-timer",
    features: [
      "17 analyses per month",
      "Study + Test modes",
      "Brand voice tuning",
      "Unlimited Vault",
      "Priority queue",
      "Embed widget",
    ],
    cta: "Choose Creator",
    highlighted: false,
  },
  {
    id: "pro", name: "Pro",
    tagline: "For full-time creators.",
    monthly: 69,
    annual: 49,
    credits: 50,
    credits_label: "50 videos / month",
    audience: "Monetizing full-timer",
    features: [
      "50 analyses per month",
      "Everything in Creator",
      "Outcome tracking",
      "Niche benchmarks",
      "Coaching nudges",
      "API access (beta)",
    ],
    cta: "Choose Pro",
    highlighted: true, // Most popular
  },
  {
    id: "agency", name: "Agency",
    tagline: "Teams & client work.",
    monthly: 199,
    annual: 149,
    credits: 150,
    credits_label: "150 videos / month (pooled)",
    audience: "SMM / multi-brand",
    features: [
      "150 pooled analyses / month",
      "Everything in Pro",
      "5 seats included",
      "White-label exports",
      "SSO",
      "Account manager",
    ],
    cta: "Choose Agency",
    highlighted: false,
  },
];

// One-time top-up packs (credits roll over indefinitely)
export const TOPUPS = [
  { id: "pack_20",  price: 25,  credits: 20, per_video: 1.25, label: "20 video credits", note: null },
  { id: "pack_40",  price: 50,  credits: 40, per_video: 1.25, label: "40 video credits", note: null },
  { id: "pack_90",  price: 100, credits: 90, per_video: 1.11, label: "90 video credits", note: "Best value" },
];

export const PRICING_FAQ = [
  {
    q: "What counts as a video?",
    a: "Every Study Mode (URL teardown) or Test Mode (draft scoring) analysis uses one credit. We don't double-charge for re-tests after edits.",
  },
  {
    q: "What happens when I run out of credits?",
    a: "We won't hard-block you. You'll see a soft prompt to top up — but anything already in progress finishes. Top-up credits roll over forever.",
  },
  {
    q: "Do credits roll over?",
    a: "Monthly subscription credits reset each billing cycle. Top-up credits never expire and stack on top of your monthly allowance.",
  },
  {
    q: "Can I switch plans?",
    a: "Yes — upgrades take effect immediately and you keep all unused credits. Downgrades apply at the end of your current billing cycle.",
  },
  {
    q: "Annual vs monthly?",
    a: "Annual saves you ~30%. You pay upfront; if you cancel mid-year your access continues through the paid period.",
  },
  {
    q: "What's in the Free tier?",
    a: "Three lifetime video analyses to test-drive Study + Test modes end-to-end, with the full 10-component teardown. No credit card required.",
  },
];
