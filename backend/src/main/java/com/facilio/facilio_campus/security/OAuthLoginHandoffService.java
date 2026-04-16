package com.facilio.facilio_campus.security;

import com.facilio.facilio_campus.dto.AuthResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Service
public class OAuthLoginHandoffService {

    private final ConcurrentMap<String, StoredAuthResponse> pendingCodes = new ConcurrentHashMap<>();
    private final Duration codeTtl;
    private final Clock clock;

    @Autowired
    public OAuthLoginHandoffService(@Value("${app.oauth2.code-ttl-seconds:120}") long codeTtlSeconds) {
        this(Duration.ofSeconds(codeTtlSeconds), Clock.systemUTC());
    }

    OAuthLoginHandoffService(Duration codeTtl, Clock clock) {
        this.codeTtl = codeTtl;
        this.clock = clock;
    }

    public String issueCode(AuthResponse authResponse) {
        purgeExpiredCodes();

        String code = UUID.randomUUID().toString();
        pendingCodes.put(code, new StoredAuthResponse(authResponse, clock.instant().plus(codeTtl)));
        return code;
    }

    public Optional<AuthResponse> consumeCode(String code) {
        if (code == null || code.isBlank()) {
            return Optional.empty();
        }

        StoredAuthResponse storedAuthResponse = pendingCodes.remove(code);
        if (storedAuthResponse == null || storedAuthResponse.expiresAt().isBefore(clock.instant())) {
            return Optional.empty();
        }

        return Optional.of(storedAuthResponse.authResponse());
    }

    private void purgeExpiredCodes() {
        Instant now = clock.instant();
        pendingCodes.entrySet().removeIf(entry -> entry.getValue().expiresAt().isBefore(now));
    }

    private record StoredAuthResponse(AuthResponse authResponse, Instant expiresAt) {
    }
}
