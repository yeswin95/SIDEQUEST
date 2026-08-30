package com.sidequest.config;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
@ConfigurationProperties(prefix = "sidequest.jwt")
@Getter
@Setter
public class JwtProperties {

    private String secret;
    private long expirationMs;

    @PostConstruct
    void validate() {
        if (secret == null || secret.trim().isEmpty()) {
            throw new IllegalStateException(
                    "sidequest.jwt.secret is not configured. Set the JWT_SECRET environment variable (32+ chars). "
                    + "On Render, set JWT_SECRET env or use generateValue:true in render.yaml.");
        }
        // Token provider hashes short secrets via SHA-256 to 32 bytes, so we only warn here.
        // Strict 32-byte throw caused 500 on registration when Render generated short secret.
        if (secret.getBytes().length < 32) {
            log.warn("sidequest.jwt.secret is shorter than 32 bytes ({} bytes). "
                    + "It will be SHA-256 hashed to 32 bytes by JwtTokenProvider. "
                    + "For production, use 32+ char random secret (openssl rand -base64 32).",
                    secret.getBytes().length);
        }
    }
}
