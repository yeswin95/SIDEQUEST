package com.sidequest.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SkillNodeDTO {

    private UUID id;
    private String skillName;
    private String category;

    @Builder.Default
    private List<SkillNodeDTO> children = new ArrayList<>();
}
