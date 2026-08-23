package com.sidequest.repository;

import com.sidequest.entity.ProjectRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProjectRoleRepository extends JpaRepository<ProjectRole, UUID> {

    @Query("""
            SELECT pr FROM ProjectRole pr
            JOIN FETCH pr.project p
            JOIN FETCH p.owner o
            LEFT JOIN FETCH pr.requiredSkills s
            WHERE pr.id = :id
            """)
    Optional<ProjectRole> findByIdWithProjectAndSkills(@Param("id") UUID id);

    List<ProjectRole> findByProjectId(UUID projectId);
}
