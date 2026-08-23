package com.sidequest.repository;

import com.sidequest.entity.UserSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserSkillRepository extends JpaRepository<UserSkill, UUID> {

    @Query("""
            SELECT us FROM UserSkill us
            JOIN FETCH us.skill
            WHERE us.user.id = :userId
            ORDER BY us.skill.category ASC, us.skill.skillName ASC
            """)
    List<UserSkill> findByUserIdWithSkill(@Param("userId") UUID userId);

    Optional<UserSkill> findByUser_IdAndSkill_Id(UUID userId, UUID skillId);
}
