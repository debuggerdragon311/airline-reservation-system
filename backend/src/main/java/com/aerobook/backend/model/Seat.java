package com.aerobook.backend.model;

import com.aerobook.backend.model.enums.SeatClass;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(
        name = "seats",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_seat_flight_number",
                columnNames = {"flight_id", "seat_number"}
        )
)
@Getter
@Setter
@NoArgsConstructor
public class Seat {

    @Id
    @UuidGenerator(style = UuidGenerator.Style.TIME)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "flight_id", nullable = false, foreignKey = @ForeignKey(name = "fk_seat_flight"))
    private Flight flight;

    @NotBlank
    @Size(max = 4)
    @Column(name = "seat_number", nullable = false, length = 4)
    private String seatNumber;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "class", nullable = false, length = 10)
    private SeatClass seatClass;

    @Column(name = "is_available", nullable = false)
    private boolean isAvailable = true;

    /*
     * Optimistic lock — Hibernate increments this on every UPDATE.
     * If two transactions read the same version and both attempt to write,
     * the second throws OptimisticLockException. DO NOT remove or set manually.
     */
    @Version
    @Column(nullable = false)
    private Integer version = 0;
}