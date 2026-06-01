package com.aerobook.backend.security;

import com.aerobook.backend.model.Passenger;
import com.aerobook.backend.repository.PassengerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final PassengerRepository passengerRepository;

    /*
     * Spring Security calls this with the email as the "username".
     * Loads the Passenger from DB and wraps it in a UserDetails
     * object Spring Security can work with.
     */
    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        Passenger passenger = passengerRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "No passenger found with email: " + email
                ));

        return new User(
                passenger.getEmail(),
                passenger.getPasswordHash(),
                List.of(new SimpleGrantedAuthority(
                        "ROLE_" + passenger.getRole().name()))
        );
    }

    /*
     * Used by JwtFilter — token subject is the UUID,
     * so we load by id instead of email.
     */
    public UserDetails loadUserByPassengerId(UUID id) {

        Passenger passenger = passengerRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "No passenger found with id: " + id
                ));

        return new User(
                passenger.getEmail(),
                passenger.getPasswordHash(),
                List.of(new SimpleGrantedAuthority(
                        "ROLE_" + passenger.getRole().name()))
        );
    }
}