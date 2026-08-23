package com.sidequest.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamMemberDTO {

    private UUID userId;
    private String fullName;
    private String email;
    private Short collegeYear;
    private String major;
    private UUID roleId;
    private String roleTitle;
    private Instant joinedAt;
    @Builder.Default
    private List<UserSkillDTO> skills = new ArrayList<>();
}
