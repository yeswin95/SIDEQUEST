package com.sidequest.service;

import com.sidequest.dto.request.VoteRequest;
import com.sidequest.entity.Project;
import com.sidequest.entity.ProjectVote;
import com.sidequest.entity.User;
import com.sidequest.enums.VoteType;
import com.sidequest.exception.ResourceNotFoundException;
import com.sidequest.repository.ProjectRepository;
import com.sidequest.repository.ProjectVoteRepository;
import com.sidequest.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProjectVoteService {

    private final ProjectRepository projectRepository;
    private final ProjectVoteRepository projectVoteRepository;
    private final CurrentUserService currentUserService;

    @Transactional
    public VoteResult vote(UUID projectId, VoteRequest request) {
        User user = currentUserService.getCurrentUser();
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + projectId));

        VoteType requested = request.getType();
        Optional<ProjectVote> existingOpt = projectVoteRepository.findByProjectIdAndUserId(projectId, user.getId());

        // Toggle logic: if same type again, clear vote (like Reddit)
        if (existingOpt.isPresent() && existingOpt.get().getVoteType() == requested) {
            projectVoteRepository.delete(existingOpt.get());
            return buildResult(projectId, null);
        }

        if (requested == null) {
            existingOpt.ifPresent(projectVoteRepository::delete);
            return buildResult(projectId, null);
        }

        if (existingOpt.isPresent()) {
            ProjectVote existing = existingOpt.get();
            existing.setVoteType(requested);
            projectVoteRepository.save(existing);
        } else {
            ProjectVote vote = ProjectVote.builder()
                    .project(project)
                    .user(user)
                    .voteType(requested)
                    .build();
            projectVoteRepository.save(vote);
        }
        return buildResult(projectId, requested);
    }

    @Transactional(readOnly = true)
    public VoteResult getVoteState(UUID projectId) {
        Optional<User> userOpt = currentUserService.getCurrentUserOptional();
        long up = projectVoteRepository.countByProjectIdAndVoteType(projectId, VoteType.UP);
        long down = projectVoteRepository.countByProjectIdAndVoteType(projectId, VoteType.DOWN);
        VoteType userVote = null;
        if (userOpt.isPresent()) {
            userVote = projectVoteRepository.findByProjectIdAndUserId(projectId, userOpt.get().getId())
                    .map(ProjectVote::getVoteType).orElse(null);
        }
        return new VoteResult(projectId, up, down, userVote);
    }

    private VoteResult buildResult(UUID projectId, VoteType userVote) {
        long up = projectVoteRepository.countByProjectIdAndVoteType(projectId, VoteType.UP);
        long down = projectVoteRepository.countByProjectIdAndVoteType(projectId, VoteType.DOWN);
        // If userVote is null because we cleared, fetch actual (null)
        if (userVote == null) {
            // after delete, userVote is null
        }
        return new VoteResult(projectId, up, down, userVote);
    }

    public record VoteResult(UUID projectId, long upvotes, long downvotes, VoteType userVote) {}
}
