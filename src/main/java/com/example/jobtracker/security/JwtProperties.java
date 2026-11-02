package com.example.jobtracker.security;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {
    private String secret = "your-256-bit-secret-key-for-jobtracker-must-be-long-enough";
    private long expirationMs = 86_400_000L;
}
