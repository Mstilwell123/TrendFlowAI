# Scaffold status (box vs GitHub)

Full Runtime A tree is at `/workspace/trendflowai` on the agent box.
Branch: `feat/phase0-phase1-tiktok` · PR: https://github.com/Mstilwell123/TrendFlowAI/pull/1

## BYOK step 3 — Connect your AI (§3d) — scaffolded 2026-09-20

| Area | Status | Notes |
|------|--------|-------|
| Connect AI onboarding UI | **Scaffolded (box + GitHub)** | Step 3 `ConnectAIStep` + shared `ConnectAIForm` / `aiCatalog` / `ConnectAIFields`; Recommended badges; password keys |
| Settings mirror | **Scaffolded (box + GitHub)** | Settings → AI providers reuses `ConnectAIForm` |
| Encryption | **Scaffolded (box + GitHub)** | `crypto_keys.py` Fernet via `TRENDFLOW_KEY_ENCRYPTION_SECRET` |
| Provider adapters | **Scaffolded stubs (box + GitHub)** | `providers/{base,gemini,anthropic,xai}.py` — callable stubs; harden live HTTP later |
| Study/Test error paths using user keys | **Scaffolded (box + GitHub)** | User keys first; 402 missing keys; auth/quota → "Your API key or quota failed"; `ALLOW_DEV_SHARED_LLM_KEYS` local-only |
| Profile / onboarded gate | **Scaffolded (box + GitHub)** | `POST /profile` does not auto-onboard; `POST /onboarding/complete` requires both keys |

### Remaining (honest)
- Wire provider adapters to production SDK/HTTP with richer retry/telemetry
- E2E tests for onboarding step 3 → Study 402 → Settings save → analyze success
- Optional: replace GitHub chunk loaders with monolithic `server.py`/`llm.py` once push size limits ease

### GitHub packing notes
- `backend/server.py` + `.server_chunk_{0..8}.txt` (9-chunk loader) — complete
- `backend/llm.py` + `.llm_chunk_{0..5}.txt` (6-chunk loader) — complete
- Box source of truth remains monolithic `server.py` / `llm.py`

Source of truth: `/workspace/trendflowai`
