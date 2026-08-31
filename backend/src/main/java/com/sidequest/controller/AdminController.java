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
