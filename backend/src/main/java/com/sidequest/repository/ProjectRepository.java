package com.sidequest.repository;

import com.sidequest.entity.Project;
import com.sidequest.enums.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {

    @Query("""
            SELECT DISTINCT p FROM Project p
            JOIN FETCH p.owner o
            LEFT JOIN FETCH o.profile op
            LEFT JOIN FETCH p.roles r
            LEFT JOIN FETCH r.requiredSkills s
            WHERE (:status IS NULL OR p.status = :status)
              AND (
                :skill IS NULL OR :skill = ''
                OR LOWER(s.skillName) = LOWER(:skill)
                OR LOWER(s.category) = LOWER(:skill)
              )
              AND (
                :search IS NULL OR :search = ''
                OR LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(r.roleTitle) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(s.skillName) LIKE LOWER(CONCAT('%', :search, '%'))
              )
            ORDER BY p.createdAt DESC
            """)
    List<Project> findFilteredProjects(
            @Param("skill") String skill,
            @Param("search") String search,
            @Param("status") ProjectStatus status
    );

    @Query("""
            SELECT DISTINCT p FROM Project p
            JOIN FETCH p.owner o
            LEFT JOIN FETCH o.profile op
            LEFT JOIN FETCH p.roles r
            LEFT JOIN FETCH r.requiredSkills s
            WHERE p.id = :id
            """)
    Optional<Project> findByIdWithDetails(@Param("id") UUID id);

    List<Project> findByOwner_IdOrderByCreatedAtDesc(UUID ownerId);
}
