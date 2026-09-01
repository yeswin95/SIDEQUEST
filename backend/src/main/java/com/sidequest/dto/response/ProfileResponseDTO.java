package com.sidequest.dto.response;

import com.sidequest.enums.SkillRank;
import com.sidequest.enums.UserActiveStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileResponseDTO {

    private UUID userId;
    private String username;
    private String email;
    private String fullName;
    private String major;
    private UserActiveStatus activeStatus;
    private SkillRank rankTier;
    private String bio;
    private String avatarUrl;
    private String cardConfig;
    private List<String> unlockedRanks;
    private List<UserSkillDTO> skills;
    private Instant createdAt;
    private Instant updatedAt;
}
