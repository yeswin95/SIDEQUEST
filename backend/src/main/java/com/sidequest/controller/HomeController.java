package com.sidequest.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> home() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("application", "SIDEQUEST — Student Collaboration & Skill Matrix API");
        response.put("status", "UP");
        response.put("version", "0.0.1-SNAPSHOT");
        
        Map<String, String> endpoints = new LinkedHashMap<>();
        endpoints.put("health", "/actuator/health");
        endpoints.put("h2_console", "/h2-console");
        endpoints.put("auth_register", "/api/v1/auth/register");
        endpoints.put("auth_login", "/api/v1/auth/login");
        endpoints.put("projects_list", "/api/v1/projects");
        endpoints.put("skills_tree", "/api/v1/skills");
        endpoints.put("profiles_me", "/api/v1/profiles/me");
        
        response.put("available_endpoints", endpoints);
        return ResponseEntity.ok(response);
    }
}
