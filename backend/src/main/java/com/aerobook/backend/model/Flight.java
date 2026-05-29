package com.aerobook.backend.model;

import com.aerobook.backend.model.enums.FlightStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(
        name = "flights",
        uniqueConstraints = @UniqueConstraint(name = "uq_flight_number", columnNames = "flight_number")
)
@Getter
@Setter
@NoArgsConstructor
public class Flight {

    @Id
    @UuidGenerator(style = UuidGenerator.Style.TIME)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @NotBlank
    @Size(max = 10)
    @Column(name = "flight_number", nullable = false, unique = true, length = 10)
    private String flightNumber;

    @NotBlank
    @Size(min = 3, max = 3, message = "Origin must be a 3-letter IATA code")
    @Column(nullable = false, length = 3)
    private String origin;

    @NotBlank
    @Size(min = 3, max = 3, message = "Destination must be a 3-letter IATA code")
    @Column(nullable = false, length = 3)
    private String destination;

    @NotNull
    @Column(name = "departure_time", nullable = false)
    private Instant departureTime;

    @NotNull
    @Column(name = "arrival_time", nullable = false)
    private Instant arrivalTime;

    @NotNull
    @Min(1)
    @Column(name = "total_seats", nullable = false)
    private Integer totalSeats;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private FlightStatus status = FlightStatus.SCHEDULED;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    @Column(name = "base_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal basePrice;

    @JsonIgnore
    @OneToMany(mappedBy = "flight", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Seat> seats = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "flight", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Booking> bookings = new ArrayList<>();
}