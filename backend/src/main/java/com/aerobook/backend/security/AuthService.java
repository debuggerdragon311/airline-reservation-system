package com.aerobook.backend.security;

import com.aerobook.backend.dto.AuthResponseDTO;
import com.aerobook.backend.dto.LoginRequestDTO;
import com.aerobook.backend.dto.RegisterRequestDTO;
import com.aerobook.backend.model.Passenger;
import com.aerobook.backend.model.enums.Role;
import com.aerobook.backend.repository.PassengerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final PassengerRepository passengerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    /*
     * Registers a new passenger.
     * Checks for duplicate email, hashes password,
     * persists the entity, and returns a JWT immediately
     * so the client is authenticated after registration.
     */
    public AuthResponseDTO register(RegisterRequestDTO request) {

        if (passengerRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException(
                    "Email already in use: " + request.email()
            );
        }

        Passenger passenger = new Passenger();
        passenger.setEmail(request.email());
        passenger.setPasswordHash(passwordEncoder.encode(request.password()));
        passenger.setFirstName(request.firstName());
        passenger.setLastName(request.lastName());
        passenger.setPhone(request.phone());
        passenger.setRole(Role.PASSENGER);

        passengerRepository.save(passenger);

        String token = jwtUtil.generateToken(
                passenger.getId(),
                passenger.getRole().name()
        );

        return new AuthResponseDTO(
                token,
                passenger.getEmail(),
                passenger.getRole().name(),
                jwtUtil.extractExpiry(token)
        );
    }

    /*
     * Authenticates an existing passenger.
     * Loads by email, verifies BCrypt hash,
     * and returns a fresh JWT on success.
     * Throws BadCredentialsException on any mismatch —
     * same exception for wrong email and wrong password
     * to avoid user enumeration.
     */
    public AuthResponseDTO login(LoginRequestDTO request) {

        Passenger passenger = passengerRepository
                .findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException(
                        "Invalid email or password"
                ));

        if (!passwordEncoder.matches(request.password(), passenger.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(
                passenger.getId(),
                passenger.getRole().name()
        );

        return new AuthResponseDTO(
                token,
                passenger.getEmail(),
                passenger.getRole().name(),
                jwtUtil.extractExpiry(token)
        );
    }
}