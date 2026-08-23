import { SkillRank } from "@/lib/tierConfig";

export type SkillStatus = "locked" | "in-progress" | "mastered";

export interface Skill {
  id: string;
  name: string;
  category: string;
  level: number;
  levelLabel: string;
  progress: number;
  status: SkillStatus;
  rankTier?: SkillRank;
  parentId: string | null;
  prerequisites: string[];
  nextSkills: string[];
  goals: string[];
  resources: string[];
}

export type RarityType = "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY" | "MYTHIC";
export type ShapeType = "hexagon" | "shield" | "octagon" | "medal" | "crest" | "diamond";

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string; // lucide-react icon name
  progress: number; // 0 to 100 percentage
  status: "locked" | "in-progress" | "in_progress" | "earned";
  earnedDate?: string;
  rarity: RarityType;
  shape: ShapeType;
  category: string;
  isCampus?: boolean;
  currentValue?: number;
  maxValue?: number;
  stages?: { value: number; rarity: RarityType; shape: ShapeType }[];
  currentStageIndex?: number;
}

export interface Achievement extends Badge {}
export interface CampusBadge extends Badge {}

export interface LearningPath {
  id: string;
  label: string;
  skillIds: string[];
  icon?: string;
  name?: string;
  description?: string;
}

const baseSkills: Skill[] = [
  { id: "html", name: "HTML", category: "Frontend", level: 5, levelLabel: "Mastered", progress: 100, status: "mastered", rankTier: "PLATINUM", parentId: null, prerequisites: [], nextSkills: ["css"], goals: [], resources: ["MDN HTML Basics"] },
  { id: "css", name: "CSS", category: "Frontend", level: 5, levelLabel: "Mastered", progress: 100, status: "mastered", rankTier: "PLATINUM", parentId: "html", prerequisites: ["html"], nextSkills: ["js"], goals: [], resources: ["CSS Grid & Flexbox Guide"] },
  { id: "js", name: "JavaScript", category: "Frontend", level: 3, levelLabel: "Intermediate", progress: 72, status: "in-progress", rankTier: "GOLD", parentId: "css", prerequisites: ["html", "css"], nextSkills: ["react"], goals: ["Complete ES6", "Complete DOM manipulation", "Complete async JavaScript"], resources: ["JavaScript Fundamentals", "Advanced JavaScript"] },
  { id: "react", name: "React", category: "Frontend", level: 2, levelLabel: "Beginner", progress: 30, status: "in-progress", rankTier: "SILVER", parentId: "js", prerequisites: ["js"], nextSkills: ["typescript"], goals: ["Build a component library", "Learn hooks in depth"], resources: ["React Docs — Learn", "Thinking in React"] },
  { id: "typescript", name: "TypeScript", category: "Frontend", level: 0, levelLabel: "Locked", progress: 0, status: "locked", parentId: "react", prerequisites: ["react"], nextSkills: ["nextjs"], goals: [], resources: ["TypeScript Handbook"] },
  { id: "nextjs", name: "Next.js", category: "Frontend", level: 0, levelLabel: "Locked", progress: 0, status: "locked", parentId: "typescript", prerequisites: ["typescript"], nextSkills: [], goals: [], resources: ["Next.js Documentation"] },

  { id: "java", name: "Java", category: "Backend", level: 4, levelLabel: "Advanced", progress: 88, status: "mastered", rankTier: "GOLD", parentId: null, prerequisites: [], nextSkills: ["spring"], goals: [], resources: ["Effective Java"] },
  { id: "spring", name: "Spring Boot", category: "Backend", level: 4, levelLabel: "Advanced", progress: 90, status: "mastered", rankTier: "PLATINUM", parentId: "java", prerequisites: ["java"], nextSkills: ["microservices", "kafka"], goals: [], resources: ["Spring Boot in Action"] },
  { id: "microservices", name: "Microservices", category: "Backend", level: 5, levelLabel: "Mastered", progress: 100, status: "mastered", rankTier: "DIAMOND", parentId: "spring", prerequisites: ["spring"], nextSkills: [], goals: [], resources: ["Building Microservices"] },
  { id: "kafka", name: "Kafka", category: "Backend", level: 1, levelLabel: "Novice", progress: 15, status: "in-progress", parentId: "spring", prerequisites: ["spring"], nextSkills: [], goals: ["Understand topics & partitions", "Build a producer/consumer demo"], resources: ["Kafka: The Definitive Guide"] },

  { id: "dsa-arrays", name: "Arrays & Strings", category: "DSA", level: 3, levelLabel: "Intermediate", progress: 65, status: "in-progress", rankTier: "GOLD", parentId: null, prerequisites: [], nextSkills: ["dsa-trees"], goals: ["Solve 20 medium problems"], resources: ["NeetCode 150"] },
  { id: "dsa-trees", name: "Trees & Graphs", category: "DSA", level: 0, levelLabel: "Locked", progress: 0, status: "locked", parentId: "dsa-arrays", prerequisites: ["dsa-arrays"], nextSkills: [], goals: [], resources: ["Grokking the Coding Interview"] },
];

const skillCatalog: Record<string, string[]> = {
  Frontend: ["Vite", "Redux", "Tailwind CSS", "Bootstrap", "Responsive Design", "REST API Integration"],
  Backend: ["Node.js", "Express.js", "REST APIs", "Authentication", "JWT", "Middleware", "API Design", "WebSockets"],
  Database: ["SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "Database Design", "Indexing", "Joins", "Transactions"],
  "Full Stack": ["MERN", "Java Full Stack", "API Integration", "Authentication & Authorization", "Frontend ↔ Backend Integration", "Deployment", "System Integration"],
  "Programming & Core CS": ["Java", "JavaScript", "Data Structures", "Algorithms", "OOP", "DBMS", "Operating Systems", "Computer Networks", "Object-Oriented Design", "Problem Solving"],
  "Git & Version Control": ["Git", "GitHub", "Branching", "Merging", "Pull Requests", "Git Workflows", "Conflict Resolution"],
  "Cloud & DevOps": ["AWS", "EC2", "S3", "RDS", "Docker", "CI/CD", "Linux", "Deployment", "Environment Variables"],
  Testing: ["Unit Testing", "Integration Testing", "API Testing", "Jest", "Postman"],
  "Tools & Development": ["VS Code", "IntelliJ IDEA", "Postman", "npm", "Maven", "Figma", "Chrome DevTools"],
  "Data & AI": ["Python", "Pandas", "NumPy", "Machine Learning", "PyTorch", "Data Visualization"],
};

const existingNames = new Set(baseSkills.map((skill) => skill.name));
const catalogSkills: Skill[] = Object.entries(skillCatalog).flatMap(([category, names], categoryIndex) => names
  .filter((name) => !existingNames.has(name))
  .map((name, index) => {
    const progress = [75, 55, 35, 15, 0][(index + categoryIndex) % 5];
    return { id: `${category}-${name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""), name, category, level: progress === 0 ? 0 : Math.max(1, Math.ceil(progress / 20)), levelLabel: progress === 0 ? "Locked" : progress >= 75 ? "Advanced" : "In Progress", progress, status: progress === 0 ? "locked" : progress >= 75 ? "mastered" : "in-progress", rankTier: progress >= 75 ? "GOLD" as SkillRank : undefined, parentId: null, prerequisites: [], nextSkills: [], goals: progress > 0 && progress < 75 ? [`Advance ${name} through a practical project`] : [], resources: [`${name} learning path`] };
  }));

export const mockSkills: Skill[] = [...baseSkills, ...catalogSkills];

export const learningPaths: LearningPath[] = [
  { id: "frontend", label: "Frontend", skillIds: ["html", "css", "js", "react", "typescript", "nextjs"], icon: "💻", name: "Frontend Developer", description: "Master user interfaces, client logic, and responsive web design." },
  { id: "backend", label: "Backend", skillIds: ["java", "spring", "microservices", "kafka"], icon: "⚙️", name: "Backend Architect", description: "Build scalable APIs, databases, microservices, and streaming pipelines." },
  { id: "dsa", label: "DSA", skillIds: ["dsa-arrays", "dsa-trees"], icon: "🧮", name: "Data Structures & Algorithms", description: "Excel in technical interviews and computer science fundamentals." },
  { id: "fullstack", label: "Full Stack", skillIds: ["html", "css", "js", "react", "java", "spring"], icon: "🌐", name: "Full Stack Specialist", description: "Bridge the gap between frontend design and backend performance." },
];

export function pathProgress(path: LearningPath): number {
  const pathSkills = mockSkills.filter((s) => path.skillIds.includes(s.id));
  if (pathSkills.length === 0) return 0;
  const total = pathSkills.reduce((acc, s) => acc + s.progress, 0);
  return Math.round(total / pathSkills.length);
}

export const mockAchievements: Achievement[] = [
  {
    id: "a1",
    title: "Quest Initiate",
    description: "Joined your first campus quest party",
    icon: "Trophy",
    progress: 100,
    status: "earned",
    earnedDate: "2025-09-12",
    rarity: "COMMON",
    shape: "hexagon",
    category: "Questing"
  },
  {
    id: "a2",
    title: "Quest Hunter",
    description: "Complete quests to earn rewards and build prestige.",
    icon: "Sword",
    progress: 40,
    status: "in-progress",
    rarity: "UNCOMMON",
    shape: "shield",
    category: "Questing",
    currentValue: 10,
    maxValue: 25,
    stages: [
      { value: 10, rarity: "UNCOMMON", shape: "shield" },
      { value: 25, rarity: "RARE", shape: "octagon" },
      { value: 50, rarity: "EPIC", shape: "medal" },
      { value: 100, rarity: "LEGENDARY", shape: "crest" }
    ],
    currentStageIndex: 0
  },
  {
    id: "a3",
    title: "Quest Master",
    description: "Complete 50 unique campus quests",
    icon: "Compass",
    progress: 0,
    status: "locked",
    rarity: "EPIC",
    shape: "medal",
    category: "Questing",
    currentValue: 0,
    maxValue: 50
  },
  {
    id: "a4",
    title: "DSA Explorer",
    description: "Solve 25 Data Structures & Algorithms problems",
    icon: "Binary",
    progress: 100,
    status: "earned",
    earnedDate: "2025-10-15",
    rarity: "UNCOMMON",
    shape: "shield",
    category: "DSA"
  },
  {
    id: "a5",
    title: "Algorithm Architect",
    description: "Solve 100 Data Structures & Algorithms problems",
    icon: "GitBranch",
    progress: 12,
    status: "in-progress",
    rarity: "LEGENDARY",
    shape: "crest",
    category: "DSA",
    currentValue: 12,
    maxValue: 100
  },
  {
    id: "a6",
    title: "Skill Master",
    description: "Master your first skill to Level 5",
    icon: "Award",
    progress: 100,
    status: "earned",
    earnedDate: "2025-11-20",
    rarity: "RARE",
    shape: "octagon",
    category: "Learning"
  },
  {
    id: "a7",
    title: "Skill Tree Explorer",
    description: "Unlock 10 skills in your development path",
    icon: "GitMerge",
    progress: 60,
    status: "in-progress",
    rarity: "EPIC",
    shape: "medal",
    category: "Learning",
    currentValue: 6,
    maxValue: 10
  },
  {
    id: "a8",
    title: "Learning Streak",
    description: "Maintain a 7-day learning streak",
    icon: "Flame",
    progress: 100,
    status: "earned",
    earnedDate: "2025-12-01",
    rarity: "RARE",
    shape: "octagon",
    category: "Consistency"
  },
  {
    id: "a9",
    title: "Streak Legend",
    description: "Maintain a 30-day learning streak",
    icon: "Crown",
    progress: 23,
    status: "in-progress",
    rarity: "LEGENDARY",
    shape: "crest",
    category: "Consistency",
    currentValue: 7,
    maxValue: 30
  },
  {
    id: "a10",
    title: "Project Builder",
    description: "Publish your first full-stack web project",
    icon: "Rocket",
    progress: 100,
    status: "earned",
    earnedDate: "2025-12-10",
    rarity: "RARE",
    shape: "octagon",
    category: "Development"
  },
  {
    id: "a11",
    title: "Open Source Contributor",
    description: "Make your first pull request contribution to open source",
    icon: "Code2",
    progress: 0,
    status: "locked",
    rarity: "EPIC",
    shape: "medal",
    category: "Open Source"
  }
];

export const mockCampusBadges: CampusBadge[] = [
  {
    id: "cb1",
    title: "Campus Explorer",
    description: "Participate in your first campus developer event",
    icon: "MapPin",
    status: "earned",
    progress: 100,
    earnedDate: "2025-09-20",
    rarity: "COMMON",
    shape: "hexagon",
    category: "Campus",
    isCampus: true
  },
  {
    id: "cb2",
    title: "Hackathon Participant",
    description: "Participate in a campus or regional hackathon",
    icon: "Laptop",
    status: "earned",
    progress: 100,
    earnedDate: "2025-10-05",
    rarity: "UNCOMMON",
    shape: "shield",
    category: "Hackathons",
    isCampus: true
  },
  {
    id: "cb3",
    title: "Hackathon Champion",
    description: "Win first place in a campus-wide hackathon challenge",
    icon: "Trophy",
    status: "earned",
    progress: 100,
    earnedDate: "2025-11-12",
    rarity: "MYTHIC",
    shape: "diamond",
    category: "Hackathons",
    isCampus: true
  },
  {
    id: "cb4",
    title: "Coding Club",
    description: "Join the official student coding club or technical community guild",
    icon: "Users2",
    status: "earned",
    progress: 100,
    earnedDate: "2025-09-15",
    rarity: "COMMON",
    shape: "hexagon",
    category: "Community",
    isCampus: true
  },
  {
    id: "cb5",
    title: "Tech Speaker",
    description: "Give your first technical presentation at a student developer meetup",
    icon: "Presentation",
    status: "locked",
    progress: 0,
    rarity: "RARE",
    shape: "octagon",
    category: "Leadership",
    isCampus: true
  },
  {
    id: "cb6",
    title: "Peer Mentor",
    description: "Help 3 other students complete their initial learning path goals",
    icon: "GraduationCap",
    status: "in-progress",
    progress: 66,
    rarity: "RARE",
    shape: "octagon",
    category: "Community",
    currentValue: 2,
    maxValue: 3,
    isCampus: true
  },
  {
    id: "cb7",
    title: "Campus Leader",
    description: "Demonstrate sustained leadership as a guild officer or club lead",
    icon: "ShieldAlert",
    status: "locked",
    progress: 0,
    rarity: "LEGENDARY",
    shape: "crest",
    category: "Leadership",
    isCampus: true
  },
  {
    id: "cb8",
    title: "Community Builder",
    description: "Organize a community workshop or help 10+ students solve problems",
    icon: "Heart",
    status: "earned",
    progress: 100,
    earnedDate: "2025-11-01",
    rarity: "EPIC",
    shape: "medal",
    category: "Community",
    isCampus: true
  },
  {
    id: "cb9",
    title: "Workshop Warrior",
    description: "Complete 5 technical campus workshops or builder events",
    icon: "BookOpen",
    status: "earned",
    progress: 100,
    earnedDate: "2025-10-25",
    rarity: "UNCOMMON",
    shape: "shield",
    category: "Learning",
    isCampus: true
  },
  {
    id: "cb10",
    title: "Placement Ready",
    description: "Complete the required professional preparation path and resume peer-review",
    icon: "Briefcase",
    status: "in-progress",
    progress: 80,
    rarity: "LEGENDARY",
    shape: "crest",
    category: "Career",
    currentValue: 8,
    maxValue: 10,
    isCampus: true
  }
];
