package com.sidequest.controller;

import com.sidequest.dto.request.CreateProjectRequest;
import com.sidequest.dto.request.VoteRequest;
import com.sidequest.dto.response.ProjectResponseDTO;
import com.sidequest.enums.ProjectStatus;
import com.sidequest.service.ProjectService;
import com.sidequest.service.ProjectVoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final ProjectVoteService projectVoteService;

    @PostMapping
    public ResponseEntity<ProjectResponseDTO> createProject(@Valid @RequestBody CreateProjectRequest request) {
        ProjectResponseDTO created = projectService.createProject(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<ProjectResponseDTO>> getProjects(
            @RequestParam(required = false) String skill,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) ProjectStatus status
    ) {
        List<ProjectResponseDTO> projects = projectService.getProjects(skill, search, status);
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponseDTO> getProjectById(@PathVariable UUID id) {
        ProjectResponseDTO project = projectService.getProjectById(id);
        return ResponseEntity.ok(project);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable UUID id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{projectId}/vote")
    public ResponseEntity<Map<String, Object>> vote(@PathVariable UUID projectId, @RequestBody VoteRequest request) {
        var result = projectVoteService.vote(projectId, request);
        return ResponseEntity.ok(Map.of(
                "projectId", result.projectId(),
                "upvotes", result.upvotes(),
                "downvotes", result.downvotes(),
                "userVote", result.userVote() != null ? result.userVote().name() : "NONE"
        ));
    }

    @GetMapping("/{projectId}/vote")
    public ResponseEntity<Map<String, Object>> getVote(@PathVariable UUID projectId) {
        var result = projectVoteService.getVoteState(projectId);
        return ResponseEntity.ok(Map.of(
                "projectId", result.projectId(),
                "upvotes", result.upvotes(),
                "downvotes", result.downvotes(),
                "userVote", result.userVote() != null ? result.userVote().name() : "NONE"
        ));
    }
}
