package com.sidequest.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DatabaseMigrationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Bean
    ApplicationRunner migrateUsernameAndRankTier() {
        return args -> {
            String url = "";
            try {
                url = jdbcTemplate.getDataSource() != null
                        ? jdbcTemplate.getDataSource().getConnection().getMetaData().getURL()
                        : "";
            } catch (Exception ignored) {}
            boolean isH2 = url != null && url.toLowerCase().contains(":h2:");
            if (isH2) {
                log.info("Skipping Postgres-specific migration on H2 (url={})", url);
                return;
            }
            try {
                log.info("Running startup DB migration: ensure users.username and user_profiles.rank_tier exist");
                safeExec("CREATE EXTENSION IF NOT EXISTS citext");

                // users.username (nullable first)
                safeExec("ALTER TABLE users ADD COLUMN IF NOT EXISTS username CITEXT");

                // Backfill null usernames from email prefix + id suffix (unique)
                try {
                    Integer nullCount = jdbcTemplate.queryForObject("SELECT count(*) FROM users WHERE username IS NULL", Integer.class);
                    if (nullCount != null && nullCount > 0) {
                        log.info("Backfilling {} users with null username from email", nullCount);
                        jdbcTemplate.update("""
                                UPDATE users
                                SET username = lower(split_part(email::text, '@', 1)) || '_' || substr(id::text, 1, 4)
                                WHERE username IS NULL
                                """);
                        safeExec("""
                                DO $$
                                DECLARE r RECORD;
                                BEGIN
                                  FOR r IN SELECT username, array_agg(id) AS ids, count(*) AS cnt FROM users GROUP BY username HAVING count(*) > 1
                                  LOOP
                                    FOR i IN 2..array_length(r.ids, 1) LOOP
                                      UPDATE users SET username = r.username || '_' || substr(r.ids[i]::text, 1, 4) WHERE id = r.ids[i];
                                    END LOOP;
                                  END LOOP;
                                END $$;
                                """);
                    }
                } catch (Exception e) {
                    log.warn("Username backfill skipped: {}", e.getMessage());
                }

                safeExec("ALTER TABLE users ALTER COLUMN username SET NOT NULL");
                safeExec("ALTER TABLE users ADD CONSTRAINT users_username_not_empty CHECK (length(trim(username::text)) > 0)");
                safeExec("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users (username)");

                // user_profiles.rank_tier
                safeExec("ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS rank_tier skill_rank_tier NOT NULL DEFAULT 'BRONZE'");
                // New profile persistence columns for avatar, bio, card config
                safeExec("ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS bio TEXT");
                safeExec("ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT");
                safeExec("ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS card_config TEXT");
                // Cleanup deprecated college_year
                safeExec("DROP INDEX IF EXISTS idx_user_profiles_college_year");
                safeExec("ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_college_year_valid");
                safeExec("ALTER TABLE user_profiles DROP COLUMN IF EXISTS college_year");

                // Ensure new enum value IN_A_PARTY exists for availability persistence
                safeExec("""
                        DO $$
                        BEGIN
                          IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'IN_A_PARTY' AND enumtypid = 'user_active_status'::regtype) THEN
                            ALTER TYPE user_active_status ADD VALUE 'IN_A_PARTY';
                          END IF;
                        END
                        $$;
                        """);

                // Vote system: enum + table
                safeExec("DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vote_type') THEN CREATE TYPE vote_type AS ENUM ('UP', 'DOWN'); END IF; END $$;");
                safeExec("""
                        CREATE TABLE IF NOT EXISTS project_votes (
                            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
                            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                            vote_type vote_type NOT NULL,
                            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                            CONSTRAINT project_votes_project_user_unique UNIQUE (project_id, user_id)
                        )
                        """);
                safeExec("CREATE INDEX IF NOT EXISTS idx_project_votes_project_id ON project_votes(project_id)");
                safeExec("CREATE INDEX IF NOT EXISTS idx_project_votes_user_id ON project_votes(user_id)");

                log.info("Startup DB migration completed successfully");
            } catch (Exception e) {
                log.error("Startup DB migration failed: {}", e.getMessage(), e);
            }
        };
    }

    private void safeExec(String sql) {
        try {
            jdbcTemplate.execute(sql);
        } catch (Exception e) {
            log.debug("Migration step skipped/failed: {} — {}", sql.replaceAll("\\s+", " ").trim(), e.getMessage());
        }
    }
}
