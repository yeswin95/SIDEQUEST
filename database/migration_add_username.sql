-- Migration: add username (unique) and rank_tier to existing DB
-- Run this once on Supabase SQL Editor if you get "column u1_0.username does not exist"
-- Safe to run multiple times (IF NOT EXISTS guards).
BEGIN;

CREATE EXTENSION IF NOT EXISTS citext;

-- 1. Add username column if missing (nullable first for backfill)
ALTER TABLE users ADD COLUMN IF NOT EXISTS username CITEXT;

-- Ensure citext extension is available for uniqueness
-- Backfill existing rows: use email prefix + short id to guarantee uniqueness
UPDATE users
SET username = lower(split_part(email::text, '@', 1)) || '_' || substr(id::text, 1, 4)
WHERE username IS NULL;

-- If duplicates still exist after naive backfill, append more chars
-- This loop resolves any remaining duplicates (unlikely after purge)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT username, array_agg(id) AS ids, count(*) AS cnt FROM users GROUP BY username HAVING count(*) > 1
  LOOP
    -- keep first, rename rest
    FOR i IN 2..array_length(r.ids, 1) LOOP
      UPDATE users SET username = r.username || '_' || substr(r.ids[i]::text, 1, 4) WHERE id = r.ids[i];
    END LOOP;
  END LOOP;
END $$;

-- Now enforce NOT NULL and constraints
ALTER TABLE users ALTER COLUMN username SET NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_username_not_empty') THEN
    ALTER TABLE users ADD CONSTRAINT users_username_not_empty CHECK (length(trim(username::text)) > 0);
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users (username);

-- 2. Add rank_tier to user_profiles if missing
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='rank_tier') THEN
    ALTER TABLE user_profiles ADD COLUMN rank_tier skill_rank_tier NOT NULL DEFAULT 'BRONZE';
  END IF;
END $$;

COMMIT;

-- Verify
SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name='users' AND column_name='username';
SELECT indexname FROM pg_indexes WHERE tablename='users' AND indexname='idx_users_username';
