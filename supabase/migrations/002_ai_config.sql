-- TrendFlowAI BYOK — AI provider config on profiles
-- Mongo Runtime A stores the same fields under users.ai_config (see notes below).

-- Encrypted ciphertext only — never store plaintext API keys.
alter table profiles
  add column if not exists perception_provider text default 'gemini',
  add column if not exists perception_model text default 'gemini-2.0-flash',
  add column if not exists reason_provider text default 'anthropic',
  add column if not exists reason_model text default 'claude-sonnet-4-20250514',
  add column if not exists perception_key_enc text,
  add column if not exists reason_key_enc text;

comment on column profiles.perception_key_enc is 'Fernet ciphertext of user Gemini (or perception) API key; never returned to clients';
comment on column profiles.reason_key_enc is 'Fernet ciphertext of user Anthropic/xAI API key; never returned to clients';

-- Mongo field notes (tf_users.ai_config):
-- {
--   "perception_provider": "gemini",
--   "perception_model": "gemini-2.0-flash",
--   "reason_provider": "anthropic" | "xai",
--   "reason_model": "...",
--   "perception_key_enc": "<fernet>",
--   "reason_key_enc": "<fernet>"
-- }
-- Public API returns has_perception_key / has_reason_key booleans only.
-- onboarded is set true ONLY via POST /onboarding/complete after both keys exist.
