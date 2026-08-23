package com.sidequest.controller;

import com.sidequest.dto.request.UpsertUserSkillRequest;
import com.sidequest.dto.response.SkillNodeDTO;
import com.sidequest.dto.response.UserSkillDTO;
import com.sidequest.service.SkillService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/skills")
@RequiredArgsConstructor
public class SkillController {

    private final SkillService skillService;

    @GetMapping
    public ResponseEntity<List<SkillNodeDTO>> getSkillTree() {
        return ResponseEntity.ok(skillService.getSkillTree());
    }

    @PostMapping("/me")
    public ResponseEntity<UserSkillDTO> upsertMySkill(@Valid @RequestBody UpsertUserSkillRequest request) {
        return ResponseEntity.status(HttpStatus.OK).body(skillService.upsertMySkill(request));
    }
}
