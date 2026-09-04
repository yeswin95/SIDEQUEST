package com.sidequest.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.Map;

/**
 * Converts Render/Supabase DATABASE_URL (postgres://user:pass@host:port/db)
 * into Spring-compatible JDBC URL (jdbc:postgresql://host:port/db?sslmode=require)
 * if SPRING_DATASOURCE_URL / JDBC_DATABASE_URL is not already set.
 * Registered via META-INF/spring.factories / imports file.
 */
public class DatabaseUrlProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String jdbcUrl = environment.getProperty("SPRING_DATASOURCE_URL");
        String jdbcAlt = environment.getProperty("JDBC_DATABASE_URL");
        if (jdbcUrl != null && !jdbcUrl.isBlank()) return;
        if (jdbcAlt != null && !jdbcAlt.isBlank()) return;

        String databaseUrl = environment.getProperty("DATABASE_URL");
        if (databaseUrl == null || databaseUrl.isBlank()) return;

        String converted = convertDatabaseUrl(databaseUrl);
        if (converted == null) return;

        Map<String, Object> props = new HashMap<>();
        props.put("spring.datasource.url", converted);
        // Render Supabase URLs may contain credentials; try to extract for fallback
        // but we keep username/password override via DB_USERNAME/DB_PASSWORD if set

        environment.getPropertySources().addFirst(new MapPropertySource("databaseUrlProcessor", props));
    }

    static String convertDatabaseUrl(String databaseUrl) {
        try {
            String url = databaseUrl.trim();
            // already jdbc ?
            if (url.startsWith("jdbc:")) return url;

            // postgres://user:password@host:port/db?query
            // -> jdbc:postgresql://host:port/db?sslmode=require&query
            if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
                String withoutScheme = url.replaceFirst("^postgres(ql)?://", "");
                // split credentials@host
                // credentials are user:password@
                // we keep them in jdbc URL for simplicity (Hikari will parse)
                String jdbc = "jdbc:postgresql://" + withoutScheme;
                // Ensure sslmode for Supabase / managed postgres
                if (!jdbc.contains("sslmode=")) {
                    jdbc += (jdbc.contains("?") ? "&" : "?") + "sslmode=require";
                }
                // Supabase pgbouncer Transaction pooler (6543) fix: disable server-prepared statements
                // "prepared statement S_1 already exists" -> add prepareThreshold=0 & preferQueryMode=simple
                if (!jdbc.contains("prepareThreshold=")) {
                    jdbc += (jdbc.contains("?") ? "&" : "?") + "prepareThreshold=0";
                }
                if (!jdbc.contains("preferQueryMode=")) {
                    jdbc += (jdbc.contains("?") ? "&" : "?") + "preferQueryMode=simple";
                }
                if (!jdbc.contains("preparedStatementCacheQueries=")) {
                    jdbc += (jdbc.contains("?") ? "&" : "?") + "preparedStatementCacheQueries=0";
                }
                return jdbc;
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }
}
