-- TrendFlowAI Phase 0–1 schema (align analyses PRD + Trend Intelligence)
-- Prefer Supabase; Mongo collections remain for local Runtime A bootstrap.

create extension if not exists "pgcrypto";

-- profiles (Creator DNA home)
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id text unique not null,
  email text,
  name text,
  niche text,
  brand_voice jsonb default '{}'::jsonb,
  handle_tiktok text,
  handle_instagram text,
  handle_youtube text,
  handle_facebook text,
  dna_status text default 'empty',
  dna_summary text,
  signature_style text,
  dna_hook_patterns text[] default '{}',
  topic_clusters text[] default '{}',
  strengths text[] default '{}',
  gaps text[] default '{}',
  last_brief_at timestamptz,
  last_brief jsonb,
  posting_goal text,
  trend_alerts_enabled boolean default true,
  subscription_tier text default 'free',
  onboarded boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- analyses (canonical product table)
create table if not exists analyses (
  id uuid primary key default gen_random_uuid(),
  post_id text unique,
  user_id text not null,
  platform text not null check (platform in ('tiktok','instagram','youtube_shorts','youtube_long','facebook')),
  mode text not null check (mode in ('study','test')),
  face text,
  source_url text,
  media_url text,
  upload_id text,
  title text,
  niche text,
  description text,
  duration_sec int,
  status text not null default 'queued',
  progress int default 0,
  error text,
  perception jsonb,
  components jsonb default '[]'::jsonb,
  scorecard jsonb,
  scripts jsonb default '[]'::jsonb,
  alignment jsonb,
  hook_score numeric(5,2),
  retention_or_completion numeric(5,2),
  platform_metrics jsonb not null default '{}'::jsonb,
  overall_score numeric(5,2),
  band text check (band is null or band in ('loser','baseline','momentum','winner')),
  good_notes text[] not null default '{}',
  bad_notes text[] not null default '{}',
  refine_actions text[] not null default '{}',
  hook_patterns text[] default '{}',
  detected_angle text,
  trend_comparison jsonb,
  rubric_version text not null default 'mvp-1',
  outlier_multiplier numeric default 1.0,
  shared_slug text,
  shared_at timestamptz,
  creator_profile_id text,
  dna_run_id text,
  sent_to_swarm_command boolean not null default false,
  sent_at timestamptz,
  command_post_id text,
  export_error text,
  raw_llm jsonb,
  submitted_at timestamptz not null default now(),
  as_of timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists analyses_platform_submitted_idx on analyses (platform, submitted_at desc);
create index if not exists analyses_band_as_of_idx on analyses (band, as_of desc);
create index if not exists analyses_face_platform_idx on analyses (face, platform) where face is not null;
create index if not exists analyses_sent_idx on analyses (sent_to_swarm_command, sent_at desc);
create unique index if not exists analyses_post_id_uidx on analyses (post_id) where post_id is not null;
create unique index if not exists analyses_shared_slug_uidx on analyses (shared_slug) where shared_slug is not null;

-- trend_pulses
create table if not exists trend_pulses (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  niche text,
  topic text,
  fetched_at timestamptz not null default now(),
  as_of timestamptz not null default now(),
  video_refs jsonb not null default '[]'::jsonb,
  raw_metrics jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists trend_pulses_platform_as_of_idx on trend_pulses (platform, as_of desc);

-- trend_clusters
create table if not exists trend_clusters (
  id uuid primary key default gen_random_uuid(),
  pulse_id uuid references trend_pulses(id) on delete set null,
  platform text not null,
  angle_label text not null,
  hook_archetype text,
  member_video_ids text[] default '{}',
  why_working jsonb not null default '{}'::jsonb,
  drivers jsonb not null default '{}'::jsonb,
  as_of timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists trend_clusters_platform_as_of_idx on trend_clusters (platform, as_of desc);

-- outcomes
create table if not exists outcomes (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid references analyses(id) on delete set null,
  user_id text not null,
  script_id text,
  platform text not null,
  views int default 0,
  retention numeric(5,2) default 0,
  saves int default 0,
  shares int,
  posted_at timestamptz,
  captured_at timestamptz not null default now()
);

-- briefs (night briefs)
create table if not exists briefs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  generated_at timestamptz not null default now(),
  body text not null,
  cited_analysis_ids uuid[] default '{}',
  cited_cluster_ids uuid[] default '{}',
  created_at timestamptz not null default now()
);

-- Band cutovers (documentation comment): loser <40 · baseline 40–59 · momentum 60–79 · winner ≥80
-- Component weights: hook 0.18 · narrative 0.12 · pacing 0.10 · emotional 0.10 · audio 0.10
--   pattern_interrupt 0.08 · visual 0.08 · on_screen_text 0.08 · authenticity 0.08 · cta 0.08
