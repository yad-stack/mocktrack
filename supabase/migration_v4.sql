-- =============================================
-- MockTrack — Migration v4
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Rename time_taken to total_time and add new stat columns
alter table public.papers
  rename column time_taken to total_time;

alter table public.papers
  add column if not exists rank integer,
  add column if not exists rank_out_of integer,
  add column if not exists correct_answers integer,
  add column if not exists incorrect_answers integer,
  add column if not exists total_questions integer,
  add column if not exists sections jsonb;

-- 2. sections jsonb stores array of:
-- { name, score, max_score, attempted, total_questions, correct, incorrect, time_taken }
