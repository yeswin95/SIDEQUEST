-- =============================================================================
-- SIDEQUEST — PURGE ALL USER DATA (fresh start)
-- Run this against your Supabase/Postgres DB to delete every user and all
-- related data (projects, applications, skills). Skill taxonomy (skills table)
-- is preserved. Re-run schema.sql afterwards if you also want to drop/recreate
-- constraints.
-- =============================================================================
-- Usage:
--   psql "$DATABASE_URL" -f database/purge.sql
-- or via Supabase SQL Editor: paste and run.
-- =============================================================================

BEGIN;

-- Order matters due to FK constraints; CASCADE handles most but be explicit.

TRUNCATE TABLE
    project_applications,
    project_role_required_skills,
    project_roles,
    projects,
    user_skills,
    user_profiles,
    users
RESTART IDENTITY CASCADE;

-- Optionally also clear skill taxonomy if you want truly empty DB:
-- TRUNCATE TABLE skills RESTART IDENTITY CASCADE;

-- Verify
SELECT 'users' AS table_name, count(*) FROM users
UNION ALL SELECT 'user_profiles', count(*) FROM user_profiles
UNION ALL SELECT 'user_skills', count(*) FROM user_skills
UNION ALL SELECT 'projects', count(*) FROM projects
UNION ALL SELECT 'project_roles', count(*) FROM project_roles
UNION ALL SELECT 'project_applications', count(*) FROM project_applications;

COMMIT;

-- After purge:
-- 1. All usernames are freed — the unique constraint on users.username (CITEXT)
--    guarantees no two users can ever share the same username (case-insensitive).
--    AuthService.register validates via existsByUsernameIgnoreCase and DB unique
--    index idx_users_username raises 409 on race.
-- 2. Create a fresh user via POST /api/v1/auth/register with {username, email, password, fullName, major}
--    The user will start at BRONZE rank with 0 skills and "Not Connected" handles.
