package com.sidequest.repository;

import com.sidequest.entity.ProjectVote;
import com.sidequest.enums.VoteType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectVoteRepository extends JpaRepository<ProjectVote, UUID> {

    Optional<ProjectVote> findByProjectIdAndUserId(UUID projectId, UUID userId);

    List<ProjectVote> findByProjectId(UUID projectId);

    long countByProjectIdAndVoteType(UUID projectId, VoteType voteType);

    void deleteByProjectIdAndUserId(UUID projectId, UUID userId);
}
