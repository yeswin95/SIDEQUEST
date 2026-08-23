package com.sidequest.service;

import com.sidequest.dto.request.CreateProjectRequest;
import com.sidequest.dto.request.CreateProjectRoleRequest;
import com.sidequest.dto.response.ProjectOwnerDTO;
import com.sidequest.dto.response.ProjectResponseDTO;
import com.sidequest.dto.response.ProjectRoleDTO;
import com.sidequest.dto.response.SkillSummaryDTO;
import com.sidequest.dto.response.TeamMemberDTO;
import com.sidequest.dto.response.UserSkillDTO;
import com.sidequest.entity.Project;
import com.sidequest.entity.ProjectApplication;
import com.sidequest.entity.ProjectRole;
import com.sidequest.entity.Skill;
import com.sidequest.entity.User;
import com.sidequest.entity.UserSkill;
import com.sidequest.enums.ApplicationStatus;
import com.sidequest.enums.ProjectStatus;
import com.sidequest.exception.ResourceNotFoundException;
import com.sidequest.repository.ProjectApplicationRepository;
import com.sidequest.repository.ProjectRepository;
import com.sidequest.repository.SkillRepository;
import com.sidequest.repository.UserSkillRepository;
import com.sidequest.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectApplicationRepository projectApplicationRepository;
    private final SkillRepository skillRepository;
    private final UserSkillRepository userSkillRepository;
    private final CurrentUserService currentUserService;

    @Transactional
    public ProjectResponseDTO createProject(CreateProjectRequest request) {
        User owner = currentUserService.getCurrentUser();

        Project project = Project.builder()
                .title(request.getTitle().trim())
                .description(request.getDescription().trim())
                .repoLink(request.getRepoLink() != null ? request.getRepoLink().trim() : null)
                .owner(owner)
                .status(request.getStatus() != null ? request.getStatus() : ProjectStatus.OPEN)
                .roles(new ArrayList<>())
                .build();

        if (request.getRoles() == null || request.getRoles().isEmpty()) {
            throw new IllegalArgumentException("At least one project role is required");
        }

        for (CreateProjectRoleRequest roleRequest : request.getRoles()) {
            Set<Skill> requiredSkills = new HashSet<>();
            if (roleRequest.getRequiredSkillIds() != null && !roleRequest.getRequiredSkillIds().isEmpty()) {
                List<Skill> skills = skillRepository.findAllById(roleRequest.getRequiredSkillIds());
                if (skills.size() != roleRequest.getRequiredSkillIds().size()) {
                    throw new ResourceNotFoundException("One or more required skill IDs were not found");
                }
                requiredSkills.addAll(skills);
            }

            ProjectRole projectRole = ProjectRole.builder()
                    .roleTitle(roleRequest.getRoleTitle().trim())
                    .spotCount(roleRequest.getSpotCount())
                    .requiredSkills(requiredSkills)
                    .build();

            project.addRole(projectRole);
        }

        Project savedProject = projectRepository.save(project);
        return toProjectResponse(savedProject, Collections.emptyList(), Collections.emptyMap());
    }

    @Transactional(readOnly = true)
    public List<ProjectResponseDTO> getProjects(String skill, String search, ProjectStatus status) {
        String cleanSkill = (skill != null && !skill.trim().isEmpty()) ? skill.trim() : null;
        String cleanSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        ProjectStatus filterStatus = status != null ? status : ProjectStatus.OPEN;

        List<Project> projects = projectRepository.findFilteredProjects(cleanSkill, cleanSearch, filterStatus);

        return projects.stream().map(project -> {
            List<ProjectApplication> acceptedApps = projectApplicationRepository
                    .findByProjectIdAndStatusWithApplicant(project.getId(), ApplicationStatus.ACCEPTED);
            return toProjectResponse(project, acceptedApps, Collections.emptyMap());
        }).toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponseDTO getProjectById(UUID id) {
        Project project = projectRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        List<ProjectApplication> acceptedApplications = projectApplicationRepository
                .findByProjectIdAndStatusWithApplicant(id, ApplicationStatus.ACCEPTED);

        Set<UUID> memberUserIds = acceptedApplications.stream()
                .map(app -> app.getApplicant().getId())
                .collect(Collectors.toSet());

        Map<UUID, List<UserSkill>> userSkillsMap = memberUserIds.stream()
                .collect(Collectors.toMap(
                        userId -> userId,
                        userSkillRepository::findByUserIdWithSkill
                ));

        return toProjectResponse(project, acceptedApplications, userSkillsMap);
    }

    private ProjectResponseDTO toProjectResponse(
            Project project,
            List<ProjectApplication> acceptedApplications,
            Map<UUID, List<UserSkill>> userSkillsMap
    ) {
        Map<UUID, List<ProjectApplication>> appsByRole = acceptedApplications.stream()
                .collect(Collectors.groupingBy(app -> app.getProjectRole().getId()));

        List<ProjectRoleDTO> roleDTOs = project.getRoles().stream().map(role -> {
            int filledSpots = appsByRole.getOrDefault(role.getId(), Collections.emptyList()).size();
            int openSpots = Math.max(0, role.getSpotCount() - filledSpots);

            List<SkillSummaryDTO> skillSummaries = role.getRequiredSkills().stream()
                    .map(s -> SkillSummaryDTO.builder()
                            .id(s.getId())
                            .skillName(s.getSkillName())
                            .category(s.getCategory())
                            .build())
                    .sorted(Comparator.comparing(SkillSummaryDTO::getSkillName, String.CASE_INSENSITIVE_ORDER))
                    .toList();

            return ProjectRoleDTO.builder()
                    .id(role.getId())
                    .roleTitle(role.getRoleTitle())
                    .spotCount(role.getSpotCount())
                    .filledSpots(filledSpots)
                    .openSpots(openSpots)
                    .requiredSkills(skillSummaries)
                    .createdAt(role.getCreatedAt())
                    .build();
        }).toList();

        List<TeamMemberDTO> teamMembers = acceptedApplications.stream().map(app -> {
            User applicant = app.getApplicant();
            List<UserSkillDTO> skills = userSkillsMap.getOrDefault(applicant.getId(), Collections.emptyList())
                    .stream()
                    .map(this::toUserSkillDTO)
                    .toList();

            return TeamMemberDTO.builder()
                    .userId(applicant.getId())
                    .email(applicant.getEmail())
                    .fullName(applicant.getProfile() != null ? applicant.getProfile().getFullName() : applicant.getEmail())
                    .collegeYear(applicant.getProfile() != null ? applicant.getProfile().getCollegeYear() : null)
                    .major(applicant.getProfile() != null ? applicant.getProfile().getMajor() : null)
                    .roleId(app.getProjectRole().getId())
                    .roleTitle(app.getProjectRole().getRoleTitle())
                    .joinedAt(app.getUpdatedAt() != null ? app.getUpdatedAt() : app.getAppliedAt())
                    .skills(skills)
                    .build();
        }).toList();

        int totalSpots = roleDTOs.stream().mapToInt(ProjectRoleDTO::getSpotCount).sum();
        int totalFilled = roleDTOs.stream().mapToInt(ProjectRoleDTO::getFilledSpots).sum();
        int totalOpen = roleDTOs.stream().mapToInt(ProjectRoleDTO::getOpenSpots).sum();

        User owner = project.getOwner();
        ProjectOwnerDTO ownerDTO = ProjectOwnerDTO.builder()
                .id(owner.getId())
                .email(owner.getEmail())
                .fullName(owner.getProfile() != null ? owner.getProfile().getFullName() : owner.getEmail())
                .collegeYear(owner.getProfile() != null ? owner.getProfile().getCollegeYear() : null)
                .major(owner.getProfile() != null ? owner.getProfile().getMajor() : null)
                .build();

        return ProjectResponseDTO.builder()
                .id(project.getId())
                .title(project.getTitle())
                .description(project.getDescription())
                .repoLink(project.getRepoLink())
                .status(project.getStatus())
                .owner(ownerDTO)
                .roles(roleDTOs)
                .teamMembers(teamMembers)
                .totalSpots(totalSpots)
                .filledSpots(totalFilled)
                .openSpots(totalOpen)
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }

    private UserSkillDTO toUserSkillDTO(UserSkill userSkill) {
        return UserSkillDTO.builder()
                .id(userSkill.getId())
                .skillId(userSkill.getSkill().getId())
                .skillName(userSkill.getSkill().getSkillName())
                .category(userSkill.getSkill().getCategory())
                .rankTier(userSkill.getRankTier())
                .verificationStatus(userSkill.getVerificationStatus())
                .build();
    }
}
