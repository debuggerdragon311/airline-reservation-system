package com.aerobook.backend.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record FlightSearchResponseDTO(
        UUID id,
        String flightNumber,
        String origin,
        String destination,
        Instant departureTime,
        Instant arrivalTime,
        Integer totalSeats,
        String status,
        BigDecimal basePrice
) {}