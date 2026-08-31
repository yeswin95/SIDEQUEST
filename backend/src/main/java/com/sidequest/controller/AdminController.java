package com.sidequest.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final JdbcTemplate jdbcTemplate;

    @Value("${sidequest.admin.purge-secret:}")
    private String purgeSecret;

    @PostMapping("/migrate")
    public ResponseEntity<Map<String, Object>> migrate(
            @RequestHeader(value = "X-Purge-Secret", required = false) String providedSecret) {
        String expected = purgeSecret != null ? purgeSecret.trim() : "";
        if (!expected.isEmpty() && (providedSecret == null || !providedSecret.equals(expected))) {
            return ResponseEntity.status(403).body(Map.of(
                    "error", "Forbidden: invalid X-Purge-Secret",
                    "hint", "Set header X-Purge-Secret to value of env var PURGE_SECRET"
            ));
        }
        try {
            jdbcTemplate.execute("CREATE EXTENSION IF NOT EXISTS citext");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS username CITEXT");
            Integer nulls = jdbcTemplate.queryForObject("SELECT count(*) FROM users WHERE username IS NULL", Integer.class);
            if (nulls != null && nulls > 0) {
                jdbcTemplate.update("UPDATE users SET username = lower(split_part(email::text, '@', 1)) || '_' || substr(id::text, 1, 4) WHERE username IS NULL");
            }
            jdbcTemplate.execute("""
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
            try { jdbcTemplate.execute("ALTER TABLE users ALTER COLUMN username SET NOT NULL"); } catch (Exception ignored) {}
            try { jdbcTemplate.execute("ALTER TABLE users ADD CONSTRAINT users_username_not_empty CHECK (length(trim(username::text)) > 0)"); } catch (Exception ignored) {}
            jdbcTemplate.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users (username)");
            jdbcTemplate.execute("ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS rank_tier skill_rank_tier NOT NULL DEFAULT 'BRONZE'");
            return ResponseEntity.ok(Map.of("status", "migrated", "message", "username + rank_tier migration applied"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/purge")
    public ResponseEntity<Map<String, Object>> purge(
            @RequestHeader(value = "X-Purge-Secret", required = false) String providedSecret) {

        String expected = purgeSecret != null ? purgeSecret.trim() : "";
        // If PURGE_SECRET is configured, require it; otherwise allow purge in dev (no secret)
        if (!expected.isEmpty() && (providedSecret == null || !providedSecret.equals(expected))) {
            return ResponseEntity.status(403).body(Map.of(
                    "error", "Forbidden: invalid X-Purge-Secret",
                    "hint", "Set header X-Purge-Secret to value of env var PURGE_SECRET"
            ));
        }

        // Ensure schema is migrated before truncate (so username column exists)
        try {
            jdbcTemplate.execute("CREATE EXTENSION IF NOT EXISTS citext");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS username CITEXT");
            jdbcTemplate.execute("ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS rank_tier skill_rank_tier NOT NULL DEFAULT 'BRONZE'");
        } catch (Exception ignored) {}

        // Truncate all user-generated data; skill taxonomy preserved
        jdbcTemplate.execute("""
                TRUNCATE TABLE
                    project_applications,
                    project_role_required_skills,
                    project_roles,
                    projects,
                    user_skills,
                    user_profiles,
                    users
                RESTART IDENTITY CASCADE
                """);

        Long users = jdbcTemplate.queryForObject("SELECT count(*) FROM users", Long.class);
        Long profiles = jdbcTemplate.queryForObject("SELECT count(*) FROM user_profiles", Long.class);
        Long projects = jdbcTemplate.queryForObject("SELECT count(*) FROM projects", Long.class);

        return ResponseEntity.ok(Map.of(
                "status", "purged",
                "users", users != null ? users : 0,
                "user_profiles", profiles != null ? profiles : 0,
                "projects", projects != null ? projects : 0,
                "message", "All users, profiles, skills, projects and applications deleted. Fresh start ready. Usernames are unique (CITEXT unique index idx_users_username)."
        ));
    }
}
