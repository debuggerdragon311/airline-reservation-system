package com.aerobook.backend.dto;

import java.time.Instant;

public record AuthResponseDTO(

        String token,
        String email,
        String role,
        Instant expiresAt
) {}