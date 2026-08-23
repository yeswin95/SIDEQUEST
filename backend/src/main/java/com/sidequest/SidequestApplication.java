package com.sidequest;

import com.sidequest.config.JwtProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableConfigurationProperties(JwtProperties.class)
@EnableJpaRepositories(basePackages = "com.sidequest.repository")
@EntityScan(basePackages = "com.sidequest.entity")
public class SidequestApplication {

    public static void main(String[] args) {
        SpringApplication.run(SidequestApplication.class, args);
    }
}
