package com.sidequest.dto.response;

import com.sidequest.enums.SkillRank;
import com.sidequest.enums.SkillVerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSkillDTO {

    private UUID id;
    private UUID skillId;
    private String skillName;
    private String category;
    private SkillRank rankTier;
    private SkillVerificationStatus verificationStatus;
}
