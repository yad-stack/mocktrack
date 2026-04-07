-- =============================================
-- MockTrack — Migration v2
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Add exam_id column to papers
alter table public.papers
  add column if not exists exam_id text;

-- 2. Add exam_id column to subjects
alter table public.subjects
  add column if not exists exam_id text;

-- 3. Create user_exams table (which exams each user has selected)
create table if not exists public.user_exams (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  exam_id    text not null,
  created_at timestamptz default now(),
  unique(user_id, exam_id)
);

alter table public.user_exams enable row level security;

create policy "user_exams: own rows" on public.user_exams
  for all using (auth.uid() = user_id);

-- 4. Enable realtime on all tables (run if not already enabled)
-- Go to Supabase Dashboard → Database → Replication
-- and make sure papers, subjects, user_exams are in the publication.
-- Or run:
alter publication supabase_realtime add table public.papers;
alter publication supabase_realtime add table public.subjects;
alter publication supabase_realtime add table public.user_exams;
