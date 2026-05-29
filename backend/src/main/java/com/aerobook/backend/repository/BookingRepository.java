package com.aerobook.backend.repository;

import com.aerobook.backend.model.Booking;
import com.aerobook.backend.model.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {

    List<Booking> findByPassengerId(UUID passengerId);

    List<Booking> findByFlightId(UUID flightId);

    List<Booking> findByFlightIdAndStatus(UUID flightId, BookingStatus status);

    boolean existsBySeatId(UUID seatId);

    /*
     * Used when cancelling a flight — bulk-fetches all active bookings
     * so the service can flip them to CANCELLED and free their seats in one pass.
     */
    @Query("""
        SELECT b FROM Booking b
        WHERE b.flight.id = :flightId
          AND b.status NOT IN (
              com.aerobook.backend.model.enums.BookingStatus.CANCELLED
          )
        """)
    List<Booking> findActiveByFlightId(@Param("flightId") UUID flightId);

    /*
     * Fetches a booking with passenger and flight eagerly loaded.
     * Avoids N+1 on the booking detail endpoint.
     */
    @Query("""
        SELECT b FROM Booking b
        JOIN FETCH b.passenger
        JOIN FETCH b.flight
        JOIN FETCH b.seat
        WHERE b.id = :id
        """)
    Optional<Booking> findByIdWithDetails(@Param("id") UUID id);
}