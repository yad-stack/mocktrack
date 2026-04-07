-- =============================================
-- MockTrack — Supabase SQL Setup
-- Run this entire file in:
-- Supabase Dashboard → SQL Editor → New Query
-- =============================================

-- 1. Papers table
create table public.papers (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  type        text check (type in ('mock', 'pyp')) not null,
  subject     text,
  score       numeric not null,
  max_score   numeric not null,
  attempted   integer,
  time_taken  integer,
  percentile  numeric,
  date        date not null,
  notes       text,
  created_at  timestamptz default now()
);

-- 2. Subjects table (per user)
create table public.subjects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  sort_order  integer default 0,
  created_at  timestamptz default now()
);

-- 3. Row Level Security — users can only see their own data
alter table public.papers enable row level security;
alter table public.subjects enable row level security;

create policy "papers: own rows" on public.papers
  for all using (auth.uid() = user_id);

create policy "subjects: own rows" on public.subjects
  for all using (auth.uid() = user_id);

-- 4. Seed default subjects for new users via a trigger
create or replace function public.seed_default_subjects()
returns trigger language plpgsql security definer as $$
begin
  insert into public.subjects (user_id, name, sort_order) values
    (new.id, 'General Studies I',   1),
    (new.id, 'General Studies II',  2),
    (new.id, 'General Studies III', 3),
    (new.id, 'General Studies IV',  4),
    (new.id, 'CSAT',                5),
    (new.id, 'Essay',               6),
    (new.id, 'Optional I',          7),
    (new.id, 'Optional II',         8),
    (new.id, 'Current Affairs',     9),
    (new.id, 'Full Mock',           10),
    (new.id, 'Sectional Mock',      11),
    (new.id, 'Other',               12);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.seed_default_subjects();
