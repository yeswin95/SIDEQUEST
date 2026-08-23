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
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        User user = User.builder()
                .email(request.getEmail().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .build();

        Profile profile = Profile.builder()
                .user(user)
                .fullName(request.getFullName().trim())
                .collegeYear(request.getCollegeYear())
                .major(request.getMajor().trim())
                .activeStatus(UserActiveStatus.ACTIVE)
                .build();

        user.setProfile(profile);
        User savedUser = userRepository.save(user);

        return buildAuthResponse(savedUser);
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
        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail());

        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresInMs(jwtTokenProvider.getExpirationMs())
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getProfile().getFullName())
                .build();
    }
}
