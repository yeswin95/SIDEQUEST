package com.sidequest.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Lightweight unauthenticated health endpoint for Render free-tier cold-start
 * detection and UptimeRobot keep-alive pings.
 * <p>
 * Returns {@code {"status":"ok"}} without touching the database or requiring auth,
 * so it responds instantly even during startup and is suitable for load-balancer /
 * platform health checks.
 */
@RestController
public class HealthController {

    @GetMapping({"/api/health", "/health"})
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "ok"));
    }
}
