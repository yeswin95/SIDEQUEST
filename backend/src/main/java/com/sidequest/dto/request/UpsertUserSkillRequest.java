package com.sidequest.dto.request;

import com.sidequest.enums.SkillRank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpsertUserSkillRequest {

    @NotNull
    private UUID skillId;

    @NotNull
    private SkillRank rankTier;
}
