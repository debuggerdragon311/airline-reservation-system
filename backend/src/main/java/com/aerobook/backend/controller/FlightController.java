package com.aerobook.backend.controller;

import com.aerobook.backend.dto.FlightSearchResponseDTO;
import com.aerobook.backend.service.FlightService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/flights")
@CrossOrigin(origins = "*")
public class FlightController {

    private final FlightService flightService;

    public FlightController(FlightService flightService) {
        this.flightService = flightService;
    }

    @GetMapping("/search")
    public ResponseEntity<List<FlightSearchResponseDTO>> searchFlights(
            @RequestParam String origin,
            @RequestParam String destination,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        List<FlightSearchResponseDTO> results = flightService.searchFlights(origin, destination, date);
        return ResponseEntity.ok(results);
    }
}