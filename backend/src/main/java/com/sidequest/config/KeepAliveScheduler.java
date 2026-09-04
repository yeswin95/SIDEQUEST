package com.sidequest.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.net.HttpURLConnection;
import java.net.URL;

/**
 * Optional keep-alive self-ping to prevent Render free-tier sleep.
 * <p>
 * Enabled only when {@code sidequest.keep-alive.enabled=true} and
 * {@code sidequest.keep-alive.target-url} is set (e.g. https://sidequest-backend.onrender.com).
 * When enabled it pings {@code {target-url}/api/health} every 10 minutes.
 * <p>
 * Recommended production setup is an external monitor (UptimeRobot, cron-job.org)
 * pinging {@code /api/health} every 10 minutes — see {@code docs/keep-alive.md}.
 * This scheduler is a fallback for deployments where external monitoring is not configured.
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "sidequest.keep-alive.enabled", havingValue = "true")
public class KeepAliveScheduler {

    @Value("${sidequest.keep-alive.target-url:}")
    private String targetUrl;

    @Value("${sidequest.keep-alive.interval-ms:600000}")
    private long intervalMs;

    @Scheduled(fixedDelayString = "${sidequest.keep-alive.interval-ms:600000}")
    public void pingSelf() {
        if (targetUrl == null || targetUrl.isBlank()) {
            log.debug("Keep-alive ping skipped: target-url not configured");
            return;
        }
        String url = targetUrl.trim().replaceAll("/+$", "") + "/api/health";
        try {
            HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(10000);
            conn.setReadTimeout(10000);
            int status = conn.getResponseCode();
            log.info("Keep-alive ping to {} -> {}", url, status);
            conn.disconnect();
        } catch (Exception e) {
            log.warn("Keep-alive ping to {} failed: {}", url, e.getMessage());
        }
    }
}
