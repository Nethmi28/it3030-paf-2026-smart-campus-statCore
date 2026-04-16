package com.facilio.facilio_campus.security;

import com.facilio.facilio_campus.dto.AuthResponse;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class OAuthLoginHandoffServiceTests {

    @Test
    void issueAndConsumeCodeReturnsAuthResponseOnce() {
        OAuthLoginHandoffService handoffService = new OAuthLoginHandoffService(
                Duration.ofMinutes(2),
                Clock.fixed(Instant.parse("2026-04-16T07:00:00Z"), ZoneOffset.UTC)
        );
        AuthResponse authResponse = new AuthResponse("jwt-token", "Campus User", "ROLE_STUDENT");

        String code = handoffService.issueCode(authResponse);
        Optional<AuthResponse> exchangedResponse = handoffService.consumeCode(code);

        assertTrue(exchangedResponse.isPresent());
        assertEquals("jwt-token", exchangedResponse.get().getToken());
        assertEquals("Campus User", exchangedResponse.get().getName());
        assertEquals("ROLE_STUDENT", exchangedResponse.get().getRole());
        assertFalse(handoffService.consumeCode(code).isPresent());
    }

    @Test
    void expiredCodesCannotBeConsumed() {
        MutableClock clock = new MutableClock(Instant.parse("2026-04-16T07:00:00Z"));
        OAuthLoginHandoffService handoffService = new OAuthLoginHandoffService(
                Duration.ofSeconds(1),
                clock
        );
        AuthResponse authResponse = new AuthResponse("jwt-token", "Campus User", "ROLE_STUDENT");

        String code = handoffService.issueCode(authResponse);
        clock.advance(Duration.ofSeconds(2));

        assertTrue(code != null && !code.isBlank());
        assertFalse(handoffService.consumeCode(code).isPresent());
    }

    private static final class MutableClock extends Clock {
        private Instant currentInstant;

        private MutableClock(Instant currentInstant) {
            this.currentInstant = currentInstant;
        }

        private void advance(Duration duration) {
            currentInstant = currentInstant.plus(duration);
        }

        @Override
        public ZoneId getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(ZoneId zone) {
            return this;
        }

        @Override
        public Instant instant() {
            return currentInstant;
        }
    }
}
