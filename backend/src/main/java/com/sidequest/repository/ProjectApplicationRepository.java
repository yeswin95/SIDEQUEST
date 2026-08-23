package com.sidequest.repository;

import com.sidequest.entity.ProjectApplication;
import com.sidequest.enums.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProjectApplicationRepository extends JpaRepository<ProjectApplication, UUID> {

    Optional<ProjectApplication> findByProjectRole_IdAndApplicant_Id(UUID projectRoleId, UUID applicantId);

    boolean existsByProjectRole_IdAndApplicant_Id(UUID projectRoleId, UUID applicantId);

    long countByProjectRole_IdAndApplicationStatus(UUID projectRoleId, ApplicationStatus applicationStatus);

    @Query("""
            SELECT pa FROM ProjectApplication pa
            JOIN FETCH pa.projectRole pr
            JOIN FETCH pr.project p
            JOIN FETCH p.owner o
            JOIN FETCH pa.applicant a
            LEFT JOIN FETCH a.profile ap
            WHERE pa.id = :id
            """)
    Optional<ProjectApplication> findByIdWithDetails(@Param("id") UUID id);

    @Query("""
            SELECT pa FROM ProjectApplication pa
            JOIN FETCH pa.applicant a
            LEFT JOIN FETCH a.profile ap
            JOIN FETCH pa.projectRole pr
            WHERE pr.project.id = :projectId AND pa.applicationStatus = :status
            ORDER BY pa.appliedAt ASC
            """)
    List<ProjectApplication> findByProjectIdAndStatusWithApplicant(
            @Param("projectId") UUID projectId,
            @Param("status") ApplicationStatus status
    );

    @Query("""
            SELECT pa FROM ProjectApplication pa
            JOIN FETCH pa.projectRole pr
            JOIN FETCH pr.project p
            WHERE pa.applicant.id = :applicantId
            ORDER BY pa.appliedAt DESC
            """)
    List<ProjectApplication> findByApplicantIdWithDetails(@Param("applicantId") UUID applicantId);

    @Query("""
            SELECT pa FROM ProjectApplication pa
            JOIN FETCH pa.projectRole pr
            JOIN FETCH pr.project p
            JOIN FETCH pa.applicant a
            LEFT JOIN FETCH a.profile ap
            WHERE pr.project.id = :projectId
            ORDER BY pa.appliedAt DESC
            """)
    List<ProjectApplication> findByProjectIdWithDetails(@Param("projectId") UUID projectId);
}
