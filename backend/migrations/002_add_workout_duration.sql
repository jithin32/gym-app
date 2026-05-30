-- Run this in Supabase SQL Editor (or local psql)
ALTER TABLE workout_completions ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;
