-- =============================================
-- MockTrack — Migration v3
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Drop the old trigger that auto-seeded UPSC CSE subjects on signup
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.seed_default_subjects();

-- 2. Add onboarding_complete flag to track if user has selected their exams
alter table public.user_exams
  add column if not exists onboarding_complete boolean default false;

-- 3. Create a user_profiles table to track onboarding state cleanly
create table if not exists public.user_profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  onboarding_complete boolean default false,
  created_at  timestamptz default now()
);

alter table public.user_profiles enable row level security;

create policy "user_profiles: own row" on public.user_profiles
  for all using (auth.uid() = id);

-- 4. Auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.user_profiles (id, onboarding_complete)
  values (new.id, false)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. Backfill profiles for existing users (marks them as already onboarded)
insert into public.user_profiles (id, onboarding_complete)
select id, true from auth.users
on conflict (id) do nothing;

-- 6. Enable realtime on user_profiles
alter publication supabase_realtime add table public.user_profiles;
