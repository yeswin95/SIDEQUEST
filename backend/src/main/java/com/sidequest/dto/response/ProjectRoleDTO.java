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
public class ProjectRoleDTO {

    private UUID id;
    private String roleTitle;
    private Short spotCount;
    private int filledSpots;
    private int openSpots;
    @Builder.Default
    private List<SkillSummaryDTO> requiredSkills = new ArrayList<>();
    private Instant createdAt;
}
