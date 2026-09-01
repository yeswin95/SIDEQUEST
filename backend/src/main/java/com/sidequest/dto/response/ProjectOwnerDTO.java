package com.sidequest.dto.response;

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
public class ProjectOwnerDTO {

    private UUID id;
    private String email;
    private String fullName;
    private String major;
    private String avatarUrl;
    private String cardConfig;
    private String bio;
}
