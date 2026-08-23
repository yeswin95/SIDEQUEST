package com.sidequest.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateProjectRoleRequest {

    @NotBlank(message = "Role title is required")
    private String roleTitle;

    @NotNull(message = "Spot count is required")
    @Min(value = 1, message = "Spot count must be at least 1")
    private Short spotCount;

    @Builder.Default
    private List<UUID> requiredSkillIds = new ArrayList<>();
}
