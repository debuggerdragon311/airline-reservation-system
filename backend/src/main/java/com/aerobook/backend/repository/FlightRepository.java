package com.aerobook.backend.repository;

import com.aerobook.backend.model.Flight;
import com.aerobook.backend.model.enums.FlightStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FlightRepository extends JpaRepository<Flight, UUID> {

    boolean existsByFlightNumber(String flightNumber);

    Optional<Flight> findByFlightNumber(String flightNumber);

    /*
     * Core search query — used by GET /flights/search.
     * Filters by origin, destination, departure date window, status, and seat availability.
     * The date window covers the full calendar day in UTC.
     */
    @Query("""
        SELECT DISTINCT f FROM Flight f
        JOIN f.seats s
        WHERE f.origin      = :origin
          AND f.destination = :destination
          AND f.departureTime >= :startOfDay
          AND f.departureTime <  :endOfDay
          AND f.status      = :status
          AND s.isAvailable = true
        """)
    List<Flight> searchAvailable(
            @Param("origin")     String origin,
            @Param("destination") String destination,
            @Param("startOfDay") Instant startOfDay,
            @Param("endOfDay")   Instant endOfDay,
            @Param("status")     FlightStatus status
    );

    List<Flight> findByStatus(FlightStatus status);
}