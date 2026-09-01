package com.sidequest.service;

import com.sidequest.dto.request.UpdateApplicationStatusRequest;
import com.sidequest.dto.response.ApplicantProfileDTO;
import com.sidequest.dto.response.ApplicationResponseDTO;
import com.sidequest.dto.response.UserSkillDTO;
import com.sidequest.entity.Profile;
import com.sidequest.entity.Project;
import com.sidequest.entity.ProjectApplication;
import com.sidequest.entity.ProjectRole;
import com.sidequest.entity.User;
import com.sidequest.entity.UserSkill;
import com.sidequest.enums.ApplicationStatus;
import com.sidequest.enums.ProjectStatus;
import com.sidequest.enums.UserActiveStatus;
import com.sidequest.exception.ResourceNotFoundException;
import com.sidequest.repository.ProjectApplicationRepository;
import com.sidequest.repository.ProjectRepository;
import com.sidequest.repository.ProjectRoleRepository;
import com.sidequest.repository.UserSkillRepository;
import com.sidequest.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProjectApplicationService {

    private final ProjectApplicationRepository projectApplicationRepository;
    private final ProjectRoleRepository projectRoleRepository;
    private final UserSkillRepository userSkillRepository;
    private final ProjectRepository projectRepository;
    private final CurrentUserService currentUserService;

    @Transactional
    public ApplicationResponseDTO applyToRole(UUID projectId, UUID roleId) {
        User applicant = currentUserService.getCurrentUser();

        ProjectRole role = projectRoleRepository.findByIdWithProjectAndSkills(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Project role not found with id: " + roleId));

        Project project = role.getProject();
        if (!project.getId().equals(projectId)) {
            throw new ResourceNotFoundException("Role " + roleId + " does not belong to project " + projectId);
        }

        if (project.getStatus() != ProjectStatus.OPEN) {
            throw new IllegalArgumentException("Cannot apply: project is currently " + project.getStatus());
        }

        if (project.getOwner().getId().equals(applicant.getId())) {
            throw new IllegalArgumentException("Project owners cannot apply to their own project roles");
        }

        // Serialize concurrent applications for the same role to prevent over-acceptance
        projectRoleRepository.findByIdForUpdate(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Project role not found with id: " + roleId));

        if (projectApplicationRepository.existsByProjectRole_IdAndApplicant_Id(roleId, applicant.getId())) {
            throw new IllegalArgumentException("You have already submitted an application for this role");
        }

        long acceptedCount = projectApplicationRepository.countByProjectRole_IdAndApplicationStatus(roleId, ApplicationStatus.ACCEPTED);
        if (acceptedCount >= role.getSpotCount()) {
            throw new IllegalArgumentException("This role has no available spots remaining (" + acceptedCount + "/" + role.getSpotCount() + " filled)");
        }

        ProjectApplication application = ProjectApplication.builder()
                .projectRole(role)
                .applicant(applicant)
                .applicationStatus(ApplicationStatus.PENDING)
                .build();

        ProjectApplication saved = projectApplicationRepository.save(application);
        return toApplicationResponse(saved);
    }

    @Transactional
    public ApplicationResponseDTO updateApplicationStatus(UUID applicationId, UpdateApplicationStatusRequest request) {
        User currentUser = currentUserService.getCurrentUser();

        ProjectApplication application = projectApplicationRepository.findByIdWithDetails(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));

        ProjectRole role = application.getProjectRole();
        Project project = role.getProject();

        boolean isOwner = project.getOwner().getId().equals(currentUser.getId());
        boolean isApplicantWithPendingWithdrawal = application.getApplicant().getId().equals(currentUser.getId())
                && request.getStatus() == ApplicationStatus.REJECTED
                && application.getApplicationStatus() == ApplicationStatus.PENDING;
        if (!isOwner && !isApplicantWithPendingWithdrawal) {
            throw new AccessDeniedException("Only the project owner can decide applications; applicants may withdraw pending applications");
        }

        ApplicationStatus targetStatus = request.getStatus();
        if (targetStatus == null || targetStatus == ApplicationStatus.PENDING) {
            throw new IllegalArgumentException("Status update must be either ACCEPTED or REJECTED");
        }

        ApplicationStatus previousStatus = application.getApplicationStatus();

        if (targetStatus == ApplicationStatus.ACCEPTED && previousStatus != ApplicationStatus.ACCEPTED) {
            // Serialize concurrent decisions on the same role to prevent over-acceptance
            projectRoleRepository.findByIdForUpdate(role.getId());

            long acceptedCount = projectApplicationRepository.countByProjectRole_IdAndApplicationStatus(role.getId(), ApplicationStatus.ACCEPTED);
            if (acceptedCount >= role.getSpotCount()) {
                throw new IllegalArgumentException("Cannot accept applicant: all " + role.getSpotCount() + " spots for this role are already filled");
            }
        }

        application.setApplicationStatus(targetStatus);
        updateProjectStatus(project, targetStatus, previousStatus);
        ProjectApplication updated = projectApplicationRepository.save(application);

        return toApplicationResponse(updated);
    }

    private void updateProjectStatus(Project project, ApplicationStatus targetStatus, ApplicationStatus previousStatus) {
        if (targetStatus == ApplicationStatus.REJECTED && previousStatus == ApplicationStatus.ACCEPTED) {
            // A team member left; reopen the project so others can apply
            if (project.getStatus() == ProjectStatus.IN_PROGRESS) {
                project.setStatus(ProjectStatus.OPEN);
            }
            return;
        }

        if (targetStatus == ApplicationStatus.ACCEPTED && project.getStatus() == ProjectStatus.OPEN) {
            UUID projectId = project.getId();
            int totalSpots = projectApplicationRepository.sumSpotCountByProjectId(projectId);
            long acceptedCount = projectApplicationRepository.countByProjectRole_Project_IdAndApplicationStatus(
                    projectId, ApplicationStatus.ACCEPTED);
            if (totalSpots > 0 && acceptedCount >= totalSpots) {
                project.setStatus(ProjectStatus.IN_PROGRESS);
            }
        }
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponseDTO> getApplicationsForProject(UUID projectId) {
        User currentUser = currentUserService.getCurrentUser();

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));
        if (!project.getOwner().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Only the project owner can view applicants for this project");
        }

        return projectApplicationRepository.findByProjectIdWithDetails(projectId).stream()
                .map(this::toApplicationResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponseDTO> getMyApplications() {
        User currentUser = currentUserService.getCurrentUser();
        List<ProjectApplication> applications = projectApplicationRepository.findByApplicantIdWithDetails(currentUser.getId());
        return applications.stream().map(this::toApplicationResponse).toList();
    }

    @Transactional
    public void withdrawApplication(UUID applicationId) {
        User currentUser = currentUserService.getCurrentUser();
        ProjectApplication application = projectApplicationRepository.findByIdWithDetails(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));
        if (!application.getApplicant().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Only the applicant can withdraw this application");
        }
        if (application.getApplicationStatus() != ApplicationStatus.PENDING) {
            throw new IllegalArgumentException("Only pending applications can be withdrawn");
        }
        projectApplicationRepository.delete(application);
    }

    private ApplicationResponseDTO toApplicationResponse(ProjectApplication application) {
        User applicant = application.getApplicant();
        Profile profile = applicant.getProfile();
        List<UserSkill> userSkills = userSkillRepository.findByUserIdWithSkill(applicant.getId());

        List<UserSkillDTO> skillDTOs = userSkills.stream()
                .map(this::toUserSkillDTO)
                .toList();

        ApplicantProfileDTO applicantDTO = ApplicantProfileDTO.builder()
                .userId(applicant.getId())
                .email(applicant.getEmail())
                .fullName(profile != null ? profile.getFullName() : applicant.getEmail())
                .major(profile != null ? profile.getMajor() : null)
                .activeStatus(profile != null ? profile.getActiveStatus() : UserActiveStatus.ACTIVE)
                .bio(profile != null ? profile.getBio() : null)
                .avatarUrl(profile != null ? profile.getAvatarUrl() : null)
                .cardConfig(profile != null ? profile.getCardConfig() : null)
                .skills(skillDTOs)
                .build();

        return ApplicationResponseDTO.builder()
                .id(application.getId())
                .projectId(application.getProjectRole().getProject().getId())
                .projectTitle(application.getProjectRole().getProject().getTitle())
                .roleId(application.getProjectRole().getId())
                .roleTitle(application.getProjectRole().getRoleTitle())
                .applicationStatus(application.getApplicationStatus())
                .applicant(applicantDTO)
                .appliedAt(application.getAppliedAt())
                .updatedAt(application.getUpdatedAt())
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
