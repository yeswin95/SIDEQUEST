package com.sidequest.controller;

import com.sidequest.dto.request.UpdateProfileRequest;
import com.sidequest.dto.response.ProfileResponseDTO;
import com.sidequest.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/profiles")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/me")
    public ResponseEntity<ProfileResponseDTO> getMyProfile() {
        return ResponseEntity.ok(profileService.getMyProfile());
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ProfileResponseDTO> getPublicProfile(@PathVariable UUID userId) {
        return ResponseEntity.ok(profileService.getPublicProfile(userId));
    }

    @PutMapping("/me")
    public ResponseEntity<ProfileResponseDTO> updateMyProfile(
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        return ResponseEntity.ok(profileService.updateMyProfile(request));
    }
}
