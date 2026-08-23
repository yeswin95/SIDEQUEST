package com.sidequest.service;

import com.sidequest.dto.request.UpsertUserSkillRequest;
import com.sidequest.dto.response.SkillNodeDTO;
import com.sidequest.dto.response.UserSkillDTO;
import com.sidequest.entity.Skill;
import com.sidequest.entity.User;
import com.sidequest.entity.UserSkill;
import com.sidequest.exception.ResourceNotFoundException;
import com.sidequest.repository.SkillRepository;
import com.sidequest.repository.UserSkillRepository;
import com.sidequest.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SkillService {

    private final CurrentUserService currentUserService;
    private final SkillRepository skillRepository;
    private final UserSkillRepository userSkillRepository;

    @Transactional(readOnly = true)
    public List<SkillNodeDTO> getSkillTree() {
        List<Skill> skills = skillRepository.findAllWithParentOrdered();
        Map<UUID, SkillNodeDTO> nodesById = new LinkedHashMap<>();

        for (Skill skill : skills) {
            nodesById.put(skill.getId(), SkillNodeDTO.builder()
                    .id(skill.getId())
                    .skillName(skill.getSkillName())
                    .category(skill.getCategory())
                    .children(new ArrayList<>())
                    .build());
        }

        List<SkillNodeDTO> roots = new ArrayList<>();
        for (Skill skill : skills) {
            SkillNodeDTO node = nodesById.get(skill.getId());
            if (skill.getParentSkill() == null) {
                roots.add(node);
                continue;
            }

            SkillNodeDTO parent = nodesById.get(skill.getParentSkill().getId());
            if (parent != null) {
                parent.getChildren().add(node);
            } else {
                roots.add(node);
            }
        }

        return roots;
    }

    @Transactional
    public UserSkillDTO upsertMySkill(UpsertUserSkillRequest request) {
        User user = currentUserService.getCurrentUser();
        Skill skill = skillRepository.findById(request.getSkillId())
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found: " + request.getSkillId()));

        UserSkill userSkill = userSkillRepository.findByUser_IdAndSkill_Id(user.getId(), skill.getId())
                .map(existing -> {
                    existing.setRankTier(request.getRankTier());
                    return existing;
                })
                .orElseGet(() -> UserSkill.builder()
                        .user(user)
                        .skill(skill)
                        .rankTier(request.getRankTier())
                        .build());

        UserSkill saved = userSkillRepository.save(userSkill);
        return toUserSkillDTO(saved);
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
