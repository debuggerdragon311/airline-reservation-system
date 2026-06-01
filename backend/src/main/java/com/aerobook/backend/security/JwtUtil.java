package com.aerobook.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtUtil {

    private final SecretKey signingKey;
    private final long expirationMs;

    public JwtUtil(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration-ms:86400000}") long expirationMs
    ) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes());
        this.expirationMs = expirationMs;
    }

    /*
     * Mints a signed JWT -->
     * sub  = UUIDv7 passenger id (no integer ID exposure)
     * role = PASSENGER or ADMIN (avoids DB hit on every request)
     * iat  = now
     * exp  = now + expirationMs (default 24h)
     */
    public String generateToken(UUID passengerId, String role) {
        Instant now = Instant.now();
        Instant expiry = now.plusMillis(expirationMs);

        return Jwts.builder()
                .subject(passengerId.toString())
                .claim("role", role)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(signingKey)
                .compact();
    }

    /*
     * Extracts the passenger UUID from a validated token.
     * Always call isValid() first.
     */
    public UUID extractPassengerId(String token) {
        return UUID.fromString(parseClaims(token).getSubject());
    }

    /*
     * Extracts the role claim from a validated token.
     * Always call isValid() first.
     */
    public String extractRole(String token) {
        return parseClaims(token).get("role", String.class);
    }

    /*
     * Returns the expiry instant --> passed into AuthResponseDTO
     * so the client knows exactly when to refresh.
     */
    public Instant extractExpiry(String token) {
        return parseClaims(token).getExpiration().toInstant();
    }

    /*
     * Single validation gate that catches expired, malformed,
     * tampered, and unsupported tokens in one place.
     */
    public boolean isValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}