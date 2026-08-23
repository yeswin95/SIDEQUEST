package com.sidequest.controller;

import com.sidequest.dto.request.UpdateApplicationStatusRequest;
import com.sidequest.dto.response.ApplicationResponseDTO;
import com.sidequest.service.ProjectApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ProjectApplicationController {

    private final ProjectApplicationService projectApplicationService;

    @PostMapping("/projects/{projectId}/roles/{roleId}/apply")
    public ResponseEntity<ApplicationResponseDTO> applyToRole(
            @PathVariable UUID projectId,
            @PathVariable UUID roleId
    ) {
        ApplicationResponseDTO response = projectApplicationService.applyToRole(projectId, roleId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/applications/{applicationId}/status")
    public ResponseEntity<ApplicationResponseDTO> updateApplicationStatus(
            @PathVariable UUID applicationId,
            @Valid @RequestBody UpdateApplicationStatusRequest request
    ) {
        ApplicationResponseDTO response = projectApplicationService.updateApplicationStatus(applicationId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/projects/{projectId}/applications")
    public ResponseEntity<List<ApplicationResponseDTO>> getApplicationsForProject(@PathVariable UUID projectId) {
        List<ApplicationResponseDTO> applications = projectApplicationService.getApplicationsForProject(projectId);
        return ResponseEntity.ok(applications);
    }

    @GetMapping("/applications/me")
    public ResponseEntity<List<ApplicationResponseDTO>> getMyApplications() {
        List<ApplicationResponseDTO> applications = projectApplicationService.getMyApplications();
        return ResponseEntity.ok(applications);
    }
}
