-- =============================================================================
-- SIDEQUEST — Student Project Collaboration Platform
-- PostgreSQL DDL (normalized schema)
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- ENUM types
-- ---------------------------------------------------------------------------
CREATE TYPE user_active_status AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'SUSPENDED'
);

CREATE TYPE skill_rank_tier AS ENUM (
    'BRONZE',
    'SILVER',
    'GOLD',
    'PLATINUM',
    'DIAMOND'
);

CREATE TYPE skill_verification_status AS ENUM (
    'UNVERIFIED',
    'PENDING',
    'VERIFIED',
    'REJECTED'
);

CREATE TYPE project_status AS ENUM (
    'DRAFT',
    'OPEN',
    'IN_PROGRESS',
    'COMPLETED',
    'ARCHIVED',
    'CANCELLED'
);

CREATE TYPE application_status AS ENUM (
    'PENDING',
    'ACCEPTED',
    'REJECTED'
);

-- ---------------------------------------------------------------------------
-- users — authentication identity
-- ---------------------------------------------------------------------------
CREATE TABLE users (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    email           CITEXT          NOT NULL,
    password_hash   TEXT            NOT NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT users_email_not_empty CHECK (length(trim(email::text)) > 0),
    CONSTRAINT users_password_hash_not_empty CHECK (length(trim(password_hash)) > 0)
);

CREATE UNIQUE INDEX idx_users_email ON users (email);

-- ---------------------------------------------------------------------------
-- user_profiles — extended profile data (1:1 with users)
-- ---------------------------------------------------------------------------
CREATE TABLE user_profiles (
    user_id         UUID                PRIMARY KEY
                                        REFERENCES users (id)
                                        ON DELETE CASCADE,
    full_name       TEXT                NOT NULL,
    college_year    SMALLINT            NOT NULL,
    major           TEXT                NOT NULL,
    active_status   user_active_status  NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

    CONSTRAINT user_profiles_full_name_not_empty
        CHECK (length(trim(full_name)) > 0),
    CONSTRAINT user_profiles_college_year_valid
        CHECK (college_year BETWEEN 1 AND 8),
    CONSTRAINT user_profiles_major_not_empty
        CHECK (length(trim(major)) > 0)
);

CREATE INDEX idx_user_profiles_active_status ON user_profiles (active_status);
CREATE INDEX idx_user_profiles_college_year ON user_profiles (college_year);
CREATE INDEX idx_user_profiles_major ON user_profiles (major);

-- ---------------------------------------------------------------------------
-- skills — hierarchical skill taxonomy (tree / directed graph via parent ref)
-- ---------------------------------------------------------------------------
CREATE TABLE skills (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_name      TEXT        NOT NULL,
    category        TEXT        NOT NULL,
    parent_skill_id UUID        REFERENCES skills (id)
                                ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT skills_skill_name_not_empty
        CHECK (length(trim(skill_name)) > 0),
    CONSTRAINT skills_category_not_empty
        CHECK (length(trim(category)) > 0),
    CONSTRAINT skills_no_self_parent
        CHECK (parent_skill_id IS NULL OR parent_skill_id <> id)
);

CREATE UNIQUE INDEX idx_skills_name_category
    ON skills (skill_name, category);

CREATE INDEX idx_skills_category ON skills (category);
CREATE INDEX idx_skills_parent_skill_id ON skills (parent_skill_id);

-- ---------------------------------------------------------------------------
-- user_skills — user proficiency & verification per skill
-- ---------------------------------------------------------------------------
CREATE TABLE user_skills (
    id                  UUID                        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID                        NOT NULL
                                                    REFERENCES users (id)
                                                    ON DELETE CASCADE,
    skill_id            UUID                        NOT NULL
                                                    REFERENCES skills (id)
                                                    ON DELETE RESTRICT,
    rank_tier           skill_rank_tier             NOT NULL DEFAULT 'BRONZE',
    verification_status skill_verification_status   NOT NULL DEFAULT 'UNVERIFIED',
    created_at          TIMESTAMPTZ                 NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ                 NOT NULL DEFAULT NOW(),

    CONSTRAINT user_skills_user_skill_unique UNIQUE (user_id, skill_id)
);

CREATE INDEX idx_user_skills_user_id ON user_skills (user_id);
CREATE INDEX idx_user_skills_skill_id ON user_skills (skill_id);
CREATE INDEX idx_user_skills_rank_tier ON user_skills (rank_tier);
CREATE INDEX idx_user_skills_verification_status ON user_skills (verification_status);

-- ---------------------------------------------------------------------------
-- projects — collaboration postings owned by a user
-- ---------------------------------------------------------------------------
CREATE TABLE projects (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    title           TEXT            NOT NULL,
    description     TEXT            NOT NULL,
    repo_link       TEXT,
    owner_id        UUID            NOT NULL
                                    REFERENCES users (id)
                                    ON DELETE RESTRICT,
    status          project_status  NOT NULL DEFAULT 'DRAFT',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT projects_title_not_empty CHECK (length(trim(title)) > 0),
    CONSTRAINT projects_description_not_empty CHECK (length(trim(description)) > 0)
);

CREATE INDEX idx_projects_owner_id ON projects (owner_id);
CREATE INDEX idx_projects_status ON projects (status);
CREATE INDEX idx_projects_created_at ON projects (created_at DESC);

-- ---------------------------------------------------------------------------
-- project_roles — open positions within a project
-- ---------------------------------------------------------------------------
CREATE TABLE project_roles (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID        NOT NULL
                                REFERENCES projects (id)
                                ON DELETE CASCADE,
    role_title      TEXT        NOT NULL,
    spot_count      SMALLINT    NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT project_roles_role_title_not_empty
        CHECK (length(trim(role_title)) > 0),
    CONSTRAINT project_roles_spot_count_positive
        CHECK (spot_count > 0)
);

CREATE INDEX idx_project_roles_project_id ON project_roles (project_id);

-- ---------------------------------------------------------------------------
-- project_role_required_skills — M:N required skills per role
-- ---------------------------------------------------------------------------
CREATE TABLE project_role_required_skills (
    project_role_id UUID        NOT NULL
                                REFERENCES project_roles (id)
                                ON DELETE CASCADE,
    skill_id        UUID        NOT NULL
                                REFERENCES skills (id)
                                ON DELETE RESTRICT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (project_role_id, skill_id)
);

CREATE INDEX idx_project_role_required_skills_skill_id
    ON project_role_required_skills (skill_id);

-- ---------------------------------------------------------------------------
-- project_applications — applicants for a specific project role
-- ---------------------------------------------------------------------------
CREATE TABLE project_applications (
    id                  UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
    project_role_id     UUID                NOT NULL
                                            REFERENCES project_roles (id)
                                            ON DELETE CASCADE,
    applicant_id        UUID                NOT NULL
                                            REFERENCES users (id)
                                            ON DELETE CASCADE,
    application_status  application_status  NOT NULL DEFAULT 'PENDING',
    applied_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

    CONSTRAINT project_applications_role_applicant_unique
        UNIQUE (project_role_id, applicant_id)
);

CREATE INDEX idx_project_applications_project_role_id
    ON project_applications (project_role_id);
CREATE INDEX idx_project_applications_applicant_id
    ON project_applications (applicant_id);
CREATE INDEX idx_project_applications_status
    ON project_applications (application_status);
CREATE INDEX idx_project_applications_applied_at
    ON project_applications (applied_at DESC);

-- ---------------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_set_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_user_profiles_set_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_skills_set_updated_at
    BEFORE UPDATE ON skills
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_user_skills_set_updated_at
    BEFORE UPDATE ON user_skills
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_projects_set_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_project_roles_set_updated_at
    BEFORE UPDATE ON project_roles
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_project_applications_set_updated_at
    BEFORE UPDATE ON project_applications
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
