package com.aerobook.backend.repository;

import com.aerobook.backend.model.Seat;
import com.aerobook.backend.model.enums.SeatClass;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SeatRepository extends JpaRepository<Seat, UUID> {

    List<Seat> findByFlightId(UUID flightId);

    List<Seat> findByFlightIdAndIsAvailableTrue(UUID flightId);

    List<Seat> findByFlightIdAndSeatClassAndIsAvailableTrue(UUID flightId, SeatClass seatClass);

    /*
     * Acquires an optimistic lock on the seat row at read time.
     * The @Version field on Seat handles conflict detection at write time —
     * if another transaction has incremented the version between this read
     * and our write, Hibernate throws OptimisticLockException.
     * The service layer catches this and returns 409 to the client.
     */
    @Lock(LockModeType.OPTIMISTIC)
    @Query("SELECT s FROM Seat s WHERE s.id = :id")
    Optional<Seat> findByIdWithLock(@Param("id") UUID id);

    int countByFlightIdAndIsAvailableTrue(UUID flightId);
}