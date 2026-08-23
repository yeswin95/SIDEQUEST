package com.sidequest.dto.response;

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
    private String email;
    private String fullName;
    private Short collegeYear;
    private String major;
    private UserActiveStatus activeStatus;
    private List<UserSkillDTO> skills;
    private Instant createdAt;
    private Instant updatedAt;
}
