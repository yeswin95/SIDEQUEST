package com.sidequest.config;

import com.sidequest.entity.Skill;
import com.sidequest.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Seeds the skills table on startup if empty.
 * Mirrors frontend mockSkills (baseSkills + catalogSkills) so frontend UUID mapping works.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SkillSeeder implements ApplicationRunner {

    private final SkillRepository skillRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (skillRepository.count() > 0) {
            log.info("SkillSeeder: {} skills already present, skipping seed", skillRepository.count());
            return;
        }
        log.info("SkillSeeder: seeding skills catalog");

        List<SeedSkill> seeds = buildSeedList();
        Map<String, Skill> byKey = new LinkedHashMap<>();

        // First pass: create all skills without parent
        for (SeedSkill s : seeds) {
            Skill entity = Skill.builder()
                    .skillName(s.name)
                    .category(s.category)
                    .build();
            entity = skillRepository.save(entity);
            byKey.put(s.id, entity);
        }

        // Second pass: wire parent relationships for baseSkills hierarchy
        Map<String, String> parentMap = Map.of(
                "css", "html",
                "js", "css",
                "react", "js",
                "typescript", "react",
                "nextjs", "typescript",
                "spring", "java",
                "microservices", "spring",
                "kafka", "spring",
                "dsa-trees", "dsa-arrays"
        );
        for (Map.Entry<String, String> e : parentMap.entrySet()) {
            Skill child = byKey.get(e.getKey());
            Skill parent = byKey.get(e.getValue());
            if (child != null && parent != null) {
                child.setParentSkill(parent);
                skillRepository.save(child);
            }
        }

        log.info("SkillSeeder: seeded {} skills", byKey.size());
    }

    private List<SeedSkill> buildSeedList() {
        List<SeedSkill> list = new ArrayList<>();
        // baseSkills (12) — matches frontend lib/skillsData baseSkills
        list.add(new SeedSkill("html", "HTML", "Frontend"));
        list.add(new SeedSkill("css", "CSS", "Frontend"));
        list.add(new SeedSkill("js", "JavaScript", "Frontend"));
        list.add(new SeedSkill("react", "React", "Frontend"));
        list.add(new SeedSkill("typescript", "TypeScript", "Frontend"));
        list.add(new SeedSkill("nextjs", "Next.js", "Frontend"));
        list.add(new SeedSkill("java", "Java", "Backend"));
        list.add(new SeedSkill("spring", "Spring Boot", "Backend"));
        list.add(new SeedSkill("microservices", "Microservices", "Backend"));
        list.add(new SeedSkill("kafka", "Kafka", "Backend"));
        list.add(new SeedSkill("dsa-arrays", "Arrays & Strings", "DSA"));
        list.add(new SeedSkill("dsa-trees", "Trees & Graphs", "DSA"));

        // catalogSkills — Frontend
        addCatalog(list, "Frontend", List.of("Vite", "Redux", "Tailwind CSS", "Bootstrap", "Responsive Design", "REST API Integration"));
        // Backend
        addCatalog(list, "Backend", List.of("Node.js", "Express.js", "REST APIs", "Authentication", "JWT", "Middleware", "API Design", "WebSockets"));
        // Database
        addCatalog(list, "Database", List.of("SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "Database Design", "Indexing", "Joins", "Transactions"));
        // Full Stack
        addCatalog(list, "Full Stack", List.of("MERN", "Java Full Stack", "API Integration", "Authentication & Authorization", "Frontend ↔ Backend Integration", "Deployment", "System Integration"));
        // Programming & Core CS
        addCatalog(list, "Programming & Core CS", List.of("Java", "JavaScript", "Data Structures", "Algorithms", "OOP", "DBMS", "Operating Systems", "Computer Networks", "Object-Oriented Design", "Problem Solving"));
        // Git & Version Control
        addCatalog(list, "Git & Version Control", List.of("Git", "GitHub", "Branching", "Merging", "Pull Requests", "Git Workflows", "Conflict Resolution"));
        // Cloud & DevOps
        addCatalog(list, "Cloud & DevOps", List.of("AWS", "EC2", "S3", "RDS", "Docker", "CI/CD", "Linux", "Deployment", "Environment Variables"));
        // Testing
        addCatalog(list, "Testing", List.of("Unit Testing", "Integration Testing", "API Testing", "Jest", "Postman"));
        // Tools & Development
        addCatalog(list, "Tools & Development", List.of("VS Code", "IntelliJ IDEA", "Postman", "npm", "Maven", "Figma", "Chrome DevTools"));
        // Data & AI
        addCatalog(list, "Data & AI", List.of("Python", "Pandas", "NumPy", "Machine Learning", "PyTorch", "Data Visualization"));

        // Deduplicate by (skillName, category) — same as DB unique index
        Map<String, SeedSkill> dedup = new LinkedHashMap<>();
        for (SeedSkill s : list) {
            String key = (s.name.toLowerCase() + "::" + s.category.toLowerCase());
            // Keep first occurrence; also dedup Java/JavaScript that already exist in baseSkills but with different category
            // Frontend dedup filters existingNames, so reproduce that: skip if name already seen in baseSkills set
            if (dedup.containsKey(key)) continue;
            // second level: if name + category duplicate, skip
            dedup.put(key, s);
        }
        // Re-apply frontend existingNames filter: remove catalog entries where name already in baseSkills
        java.util.Set<String> baseNames = java.util.Set.of("HTML", "CSS", "JavaScript", "React", "TypeScript", "Next.js", "Java", "Spring Boot", "Microservices", "Kafka", "Arrays & Strings", "Trees & Graphs");
        List<SeedSkill> filtered = new ArrayList<>();
        for (SeedSkill s : dedup.values()) {
            // Keep baseSkills as-is; for catalog, skip if baseNames contains s.name (case-sensitive match as frontend)
            if (!isBase(s.id) && baseNames.contains(s.name)) continue;
            filtered.add(s);
        }
        return filtered;
    }

    private boolean isBase(String id) {
        return java.util.Set.of("html", "css", "js", "react", "typescript", "nextjs", "java", "spring", "microservices", "kafka", "dsa-arrays", "dsa-trees").contains(id);
    }

    private void addCatalog(List<SeedSkill> list, String category, List<String> names) {
        for (String name : names) {
            String id = (category + "-" + name).toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
            list.add(new SeedSkill(id, name, category));
        }
    }

    private record SeedSkill(String id, String name, String category) {}
}
