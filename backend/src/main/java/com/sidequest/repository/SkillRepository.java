package com.sidequest.repository;

import com.sidequest.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SkillRepository extends JpaRepository<Skill, UUID> {

    @Query("""
            SELECT s FROM Skill s
            LEFT JOIN FETCH s.parentSkill
            ORDER BY s.category ASC, s.skillName ASC
            """)
    List<Skill> findAllWithParentOrdered();
}
