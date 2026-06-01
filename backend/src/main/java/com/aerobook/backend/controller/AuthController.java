package com.aerobook.backend.controller;

import com.aerobook.backend.dto.AuthResponseDTO;
import com.aerobook.backend.dto.LoginRequestDTO;
import com.aerobook.backend.dto.RegisterRequestDTO;
import com.aerobook.backend.security.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /*
     * Register a new passenger account.
     * Returns 201 Created with a JWT on success.
     * Returns 409 Conflict if email already exists.
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(
            @Valid @RequestBody RegisterRequestDTO request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(authService.register(request));
    }

    /*
     * Authenticate an existing passenger.
     * Returns 200 OK with a JWT on success.
     * Returns 401 Unauthorized on bad credentials.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(
            @Valid @RequestBody LoginRequestDTO request
    ) {
        return ResponseEntity.ok(authService.login(request));
    }
}