package com.sidequest.config;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

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
                    "sidequest.jwt.secret is not configured. Set the JWT_SECRET environment variable.");
        }
        if (secret.getBytes().length < 32) {
            throw new IllegalStateException(
                    "sidequest.jwt.secret must be at least 256 bits (32 bytes) long.");
        }
    }
}
