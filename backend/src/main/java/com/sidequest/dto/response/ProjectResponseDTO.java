package com.sidequest.dto.response;

import com.sidequest.enums.ProjectStatus;
import com.sidequest.enums.VoteType;
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
public class ProjectResponseDTO {

    private UUID id;
    private String title;
    private String description;
    private String repoLink;
    private ProjectStatus status;
    private ProjectOwnerDTO owner;
    @Builder.Default
    private List<ProjectRoleDTO> roles = new ArrayList<>();
    @Builder.Default
    private List<TeamMemberDTO> teamMembers = new ArrayList<>();
    private int totalSpots;
    private int filledSpots;
    private int openSpots;
    private long upvotes;
    private long downvotes;
    private VoteType userVote;
    private Instant createdAt;
    private Instant updatedAt;
}
