package com.sidequest.dto.request;

import com.sidequest.enums.ProjectStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateProjectRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    private String repoLink;

    private ProjectStatus status;

    @NotEmpty(message = "At least one project role is required")
    @Valid
    @Builder.Default
    private List<CreateProjectRoleRequest> roles = new ArrayList<>();
}
