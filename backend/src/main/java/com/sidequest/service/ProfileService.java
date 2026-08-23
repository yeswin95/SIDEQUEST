package com.sidequest.service;

import com.sidequest.dto.request.UpdateProfileRequest;
import com.sidequest.dto.response.ProfileResponseDTO;
import com.sidequest.dto.response.UserSkillDTO;
import com.sidequest.entity.Profile;
import com.sidequest.entity.User;
import com.sidequest.entity.UserSkill;
import com.sidequest.exception.ResourceNotFoundException;
import com.sidequest.repository.ProfileRepository;
import com.sidequest.repository.UserSkillRepository;
import com.sidequest.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final CurrentUserService currentUserService;
    private final ProfileRepository profileRepository;
    private final UserSkillRepository userSkillRepository;

    @Transactional(readOnly = true)
    public ProfileResponseDTO getMyProfile() {
        User user = currentUserService.getCurrentUser();
        Profile profile = profileRepository.findById(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));
        List<UserSkill> userSkills = userSkillRepository.findByUserIdWithSkill(user.getId());
        return toProfileResponse(user, profile, userSkills);
    }

    @Transactional
    public ProfileResponseDTO updateMyProfile(UpdateProfileRequest request) {
        User user = currentUserService.getCurrentUser();
        Profile profile = profileRepository.findById(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        profile.setFullName(request.getFullName().trim());
        profile.setCollegeYear(request.getCollegeYear());
        profile.setMajor(request.getMajor().trim());
        profile.setActiveStatus(request.getActiveStatus());

        Profile savedProfile = profileRepository.save(profile);
        List<UserSkill> userSkills = userSkillRepository.findByUserIdWithSkill(user.getId());
        return toProfileResponse(user, savedProfile, userSkills);
    }

    private ProfileResponseDTO toProfileResponse(User user, Profile profile, List<UserSkill> userSkills) {
        return ProfileResponseDTO.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(profile.getFullName())
                .collegeYear(profile.getCollegeYear())
                .major(profile.getMajor())
                .activeStatus(profile.getActiveStatus())
                .skills(userSkills.stream().map(this::toUserSkillDTO).toList())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }

    private UserSkillDTO toUserSkillDTO(UserSkill userSkill) {
        return UserSkillDTO.builder()
                .id(userSkill.getId())
                .skillId(userSkill.getSkill().getId())
                .skillName(userSkill.getSkill().getSkillName())
                .category(userSkill.getSkill().getCategory())
                .rankTier(userSkill.getRankTier())
                .verificationStatus(userSkill.getVerificationStatus())
                .build();
    }
}
