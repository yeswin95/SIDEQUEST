package com.sidequest.service;

import com.sidequest.dto.request.LoginRequest;
import com.sidequest.dto.request.RegisterRequest;
import com.sidequest.dto.response.AuthResponse;
import com.sidequest.entity.Profile;
import com.sidequest.entity.User;
import com.sidequest.enums.UserActiveStatus;
import com.sidequest.repository.UserRepository;
import com.sidequest.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Validate required DB fields explicitly to give 400 not 500
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (request.getPassword() == null || request.getPassword().length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters");
        }
        if (request.getFullName() == null || request.getFullName().trim().isEmpty()) {
            throw new IllegalArgumentException("Full name is required");
        }
        if (request.getMajor() == null || request.getMajor().trim().isEmpty()) {
            throw new IllegalArgumentException("Major is required");
        }
        if (request.getCollegeYear() == null) {
            throw new IllegalArgumentException("College year is required");
        }

        String email = request.getEmail().trim().toLowerCase();
        log.info("Register attempt for email={} fullName={} major={} collegeYear={}", email, request.getFullName(), request.getMajor(), request.getCollegeYear());

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("Email is already registered");
        }

        try {
            User user = User.builder()
                    .email(email)
                    .passwordHash(passwordEncoder.encode(request.getPassword()))
                    .build();

            Profile profile = Profile.builder()
                    .user(user)
                    .fullName(request.getFullName().trim())
                    // Ensure DB constraints: college_year 1-8, major not empty, fullName not empty
                    .collegeYear(request.getCollegeYear())
                    .major(request.getMajor().trim())
                    .activeStatus(UserActiveStatus.ACTIVE)
                    .build();

            user.setProfile(profile);
            // Completed skills / XP / rank / badges are zeroed by default - no extra DB fields needed.
            // UserSkill, XP are derived tables initialized empty.
            User savedUser = userRepository.save(user);
            log.info("User registered successfully id={} email={}", savedUser.getId(), savedUser.getEmail());

            return buildAuthResponse(savedUser);
        } catch (Exception ex) {
            log.error("Registration failed for email={} error={}", email, ex.getMessage(), ex);
            throw ex;
        }
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail().trim().toLowerCase(),
                            request.getPassword()
                    )
            );
        } catch (AuthenticationException ex) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        User user = userRepository.findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        if (user.getId() == null) {
            log.error("buildAuthResponse called with null userId for email={}", user.getEmail());
            throw new IllegalStateException("User ID not generated - database save may have failed");
        }
        // Profile may be lazy; guard against NPE which would become 500
        String fullName = user.getProfile() != null ? user.getProfile().getFullName() : "";
        String email = user.getEmail();

        String token;
        try {
            token = jwtTokenProvider.generateToken(user.getId(), email);
        } catch (Exception ex) {
            log.error("JWT generation failed for userId={} - check JWT_SECRET (32+ chars) and DB connection", user.getId(), ex);
            throw new IllegalStateException("Failed to generate JWT - check JWT_SECRET and server config", ex);
        }

        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresInMs(jwtTokenProvider.getExpirationMs())
                .userId(user.getId())
                .email(email)
                .fullName(fullName)
                .build();
    }
}
