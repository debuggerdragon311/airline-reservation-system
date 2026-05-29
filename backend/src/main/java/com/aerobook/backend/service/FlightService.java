package com.aerobook.backend.service;

import com.aerobook.backend.model.Flight;
import com.aerobook.backend.model.enums.FlightStatus; // <-- Updated path here!
import com.aerobook.backend.repository.FlightRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.Instant;
import java.util.List;

@Service
public class FlightService {

    private final FlightRepository flightRepository;

    public FlightService(FlightRepository flightRepository) {
        this.flightRepository = flightRepository;
    }

    public List<Flight> searchFlights(String origin, String destination, LocalDate date) {
        // Convert local date to UTC 24-hour window for the database
        Instant startOfDay = date.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant endOfDay = date.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);

        // Call the database query with the correctly imported Enum
        return flightRepository.searchAvailable(
                origin,
                destination,
                startOfDay,
                endOfDay,
                FlightStatus.SCHEDULED
        );
    }
}