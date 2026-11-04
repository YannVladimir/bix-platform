package com.bix.backend.auth;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtUtilsTest {

    private JwtUtils jwtUtils;

    @BeforeEach
    void setUp() {
        jwtUtils = new JwtUtils();
        ReflectionTestUtils.setField(jwtUtils, "secret", "unit-test-signing-secret-at-least-32-bytes-long");
        ReflectionTestUtils.setField(jwtUtils, "expiration", 86_400_000L);
    }

    private UserDetails managerUser(String email) {
        return new org.springframework.security.core.userdetails.User(
                email, "irrelevant-hash", Collections.singletonList(new SimpleGrantedAuthority("ROLE_MANAGER")));
    }

    @Test
    void generatedTokenCanBeValidatedForTheSameUser() {
        UserDetails user = managerUser("manager@example.com");

        String token = jwtUtils.generateToken(user, 42L, "Acme Co", "Jane Manager", "EN");

        assertTrue(jwtUtils.validateToken(token, user));
        assertEquals("manager@example.com", jwtUtils.extractUsername(token));
        assertEquals(42L, jwtUtils.extractCompanyId(token));
    }

    @Test
    void tokenIsNotValidForADifferentUser() {
        UserDetails user = managerUser("manager@example.com");
        UserDetails otherUser = managerUser("someone-else@example.com");

        String token = jwtUtils.generateToken(user, 1L, "Acme Co", "Jane Manager", "EN");

        assertFalse(jwtUtils.validateToken(token, otherUser));
    }

    @Test
    void companyIdClaimIsOmittedWhenNull() {
        UserDetails user = managerUser("solo-admin@example.com");

        String token = jwtUtils.generateToken(user, null, null, "Solo Admin", "EN");

        assertNull(jwtUtils.extractCompanyId(token));
    }

    @Test
    void tamperedTokenFailsSignatureValidation() {
        UserDetails user = managerUser("manager@example.com");
        String token = jwtUtils.generateToken(user, 1L, "Acme Co", "Jane Manager", "EN");

        // Flip a character in the payload segment to simulate tampering.
        String[] parts = token.split("\\.");
        char[] payload = parts[1].toCharArray();
        payload[payload.length - 1] = payload[payload.length - 1] == 'a' ? 'b' : 'a';
        String tampered = parts[0] + "." + new String(payload) + "." + parts[2];

        assertThrows(Exception.class, () -> jwtUtils.extractUsername(tampered));
    }
}
