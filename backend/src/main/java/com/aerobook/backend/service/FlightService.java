package com.aerobook.backend.service;

import com.aerobook.backend.dto.FlightSearchResponseDTO;
import com.aerobook.backend.model.Flight;
import com.aerobook.backend.model.enums.FlightStatus;
import com.aerobook.backend.repository.FlightRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FlightService {

    private final FlightRepository flightRepository;

    public FlightService(FlightRepository flightRepository) {
        this.flightRepository = flightRepository;
    }

    public List<FlightSearchResponseDTO> searchFlights(String origin, String destination, LocalDate date) {
        Instant startOfDay = date.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant endOfDay = date.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);

        List<Flight> rawFlights = flightRepository.searchAvailable(
                origin, destination, startOfDay, endOfDay, FlightStatus.SCHEDULED
        );

        // Map raw database entities to clean DTO response containers
        return rawFlights.stream()
                .map(flight -> new FlightSearchResponseDTO(
                        flight.getId(),
                        flight.getFlightNumber(),
                        flight.getOrigin(),
                        flight.getDestination(),
                        flight.getDepartureTime(),
                        flight.getArrivalTime(),
                        flight.getTotalSeats(),
                        flight.getStatus().name(),
                        flight.getBasePrice()
                ))
                .collect(Collectors.toList());
    }
}