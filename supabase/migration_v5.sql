-- MockTrack Migration v5
-- Run in Supabase SQL Editor

alter table public.papers
  add column if not exists cutoff numeric;
