/** Recommended defaults — user choice always wins. */
export const AI_DEFAULTS = {
  perception_provider: "gemini",
  perception_model: "gemini-2.0-flash",
  reason_provider: "anthropic",
  reason_model: "claude-sonnet-4-20250514",
};

export const FALLBACK_CATALOG = {
  perception_providers: [
    {
      id: "gemini",
      label: "Google Gemini",
      recommended: true,
      models: [
        { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash", recommended: true },
        { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", recommended: false },
        { id: "gemini-1.5-pro", label: "Gemini 1.5 Pro", recommended: false },
      ],
    },
  ],
  reason_providers: [
    {
      id: "anthropic",
      label: "Anthropic Claude",
      recommended: true,
      models: [
        { id: "claude-sonnet-4-20250514", label: "Claude Sonnet 4", recommended: true },
        { id: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet", recommended: false },
        { id: "claude-3-5-haiku-20241022", label: "Claude 3.5 Haiku", recommended: false },
      ],
    },
    {
      id: "xai",
      label: "xAI Grok",
      recommended: true,
      models: [
        { id: "grok-2-latest", label: "Grok 2", recommended: true },
        { id: "grok-3-mini", label: "Grok 3 Mini", recommended: false },
      ],
    },
  ],
};
