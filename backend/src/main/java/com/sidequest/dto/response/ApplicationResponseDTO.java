package com.sidequest.dto.response;

import com.sidequest.enums.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationResponseDTO {

    private UUID id;
    private UUID projectId;
    private String projectTitle;
    private UUID roleId;
    private String roleTitle;
    private ApplicationStatus applicationStatus;
    private ApplicantProfileDTO applicant;
    private Instant appliedAt;
    private Instant updatedAt;
}
