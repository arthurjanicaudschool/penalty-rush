create extension if not exists pgcrypto;

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  anonymous_id text unique not null,
  country text not null check (char_length(country) = 2),
  username text default 'Anonyme',
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table if not exists public.daily_challenges (
  id text primary key,
  date date unique not null,
  title text not null,
  description text not null,
  config_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  score integer not null check (score >= 0),
  goals smallint not null check (goals between 0 and 5),
  accuracy numeric(5,2) not null check (accuracy between 0 and 100),
  country text not null check (char_length(country) = 2),
  challenge_id text,
  created_at timestamptz not null default now()
);

create index if not exists scores_daily_rank_idx on public.scores (created_at desc, score desc);
create index if not exists scores_country_daily_idx on public.scores (country, created_at desc, score desc);

create table if not exists public.country_totals (
  country text not null,
  total_score bigint not null default 0,
  total_players integer not null default 0,
  date date not null,
  primary key (country, date)
);

alter table public.players enable row level security;
alter table public.scores enable row level security;
alter table public.daily_challenges enable row level security;
alter table public.country_totals enable row level security;

create policy "public leaderboard read" on public.scores for select using (true);
create policy "anonymous score insert" on public.scores for insert with check (true);
create policy "public player names read" on public.players for select using (true);
create policy "anonymous player upsert" on public.players for insert with check (true);
create policy "anonymous player update" on public.players for update using (true) with check (true);
create policy "public challenges read" on public.daily_challenges for select using (true);
create policy "public country totals read" on public.country_totals for select using (true);

-- Required by the live leaderboard subscription. Safe to run more than once.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'scores'
  ) then
    alter publication supabase_realtime add table public.scores;
  end if;
end $$;
