"use client";

import { useState } from "react";
import PlayerProfileCard, { PlayerSkill, ActiveStatus } from "@/components/PlayerProfileCard";
import SkillNodeTree, { SkillTreeNode } from "@/components/SkillNodeTree";
import {
  ShieldCheck,
  Award,
  Github,
  Linkedin,
  Mail,
  Flame,
  CheckCircle2,
  FolderGit2,
  Calendar,
  Layers,
  Edit3,
} from "lucide-react";

interface ProfileSectionProps {
  userProfile?: {
    fullName: string;
    major: string;
    gradYear: number;
    activeStatus: ActiveStatus;
    bio?: string;
    skills: PlayerSkill[];
  };
  skillTreeNodes?: SkillTreeNode[];
}

const defaultSkills: PlayerSkill[] = [
  { id: "1", skillName: "Java", category: "Backend", rankTier: "GOLD", verified: true },
  { id: "2", skillName: "Spring Boot", category: "Backend", rankTier: "PLATINUM", verified: true },
  { id: "3", skillName: "React", category: "Frontend", rankTier: "SILVER", verified: true },
  { id: "4", skillName: "PostgreSQL", category: "Data", rankTier: "GOLD" },
  { id: "5", skillName: "Docker", category: "DevOps", rankTier: "PLATINUM", verified: true },
  { id: "6", skillName: "Figma", category: "Design", rankTier: "BRONZE" },
];

const defaultTree: SkillTreeNode[] = [
  { id: "java", skillName: "Java", parentId: null, rankTier: "GOLD" },
  { id: "spring", skillName: "Spring Boot", parentId: "java", rankTier: "PLATINUM" },
  { id: "microservices", skillName: "Microservices", parentId: "spring", rankTier: "DIAMOND" },
  { id: "kafka", skillName: "Kafka", parentId: "spring" },
  { id: "js", skillName: "JavaScript", parentId: null, rankTier: "SILVER" },
  { id: "react", skillName: "React", parentId: "js", rankTier: "SILVER" },
  { id: "nextjs", skillName: "Next.js", parentId: "react", rankTier: "PLATINUM" },
];

export default function ProfileSection({
  userProfile = {
    fullName: "Alex Rivera",
    major: "Computer Science",
    gradYear: 2027,
    activeStatus: "OPEN_TO_JOIN",
    bio: "Full stack builder passionate about distributed systems and interactive web apps. Seeking hackathon teammates!",
    skills: defaultSkills,
  },
  skillTreeNodes = defaultTree,
}: ProfileSectionProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "skilltree" | "projects">("overview");
  const [status, setStatus] = useState<ActiveStatus>(userProfile.activeStatus);

  return (
    <div className="space-y-6">
      {/* Profile Navigation Pills */}
      <div className="flex rounded-lg border border-slate-200 bg-white p-1 dark:border-[#282828] dark:bg-[#1c1c1c]">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-all ${
            activeTab === "overview"
              ? "bg-[#3ecf8e] text-[#042f1a] font-semibold shadow-sm"
              : "text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          }`}
        >
          Profile Card
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("skilltree")}
          className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-all ${
            activeTab === "skilltree"
              ? "bg-[#3ecf8e] text-[#042f1a] font-semibold shadow-sm"
              : "text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          }`}
        >
          Skill Tree
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("projects")}
          className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-all ${
            activeTab === "projects"
              ? "bg-[#3ecf8e] text-[#042f1a] font-semibold shadow-sm"
              : "text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          }`}
        >
          Activity & Badges
        </button>
      </div>

      {/* Tab 1: Overview Profile Card */}
      {activeTab === "overview" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <PlayerProfileCard
            fullName={userProfile.fullName}
            major={userProfile.major}
            gradYear={userProfile.gradYear}
            activeStatus={status}
            skills={userProfile.skills}
            bio={userProfile.bio}
          />

          {/* Quick Status Selector */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-[#282828] dark:bg-[#1c1c1c]">
            <div className="mb-2 text-xs font-semibold text-slate-900 dark:text-[#ededed]">
              Collaboration Availability
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {(["OPEN_TO_JOIN", "IN_A_PARTY", "OFFLINE"] as ActiveStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`rounded-md border p-2 text-center text-[11px] font-medium transition-all ${
                    status === st
                      ? "border-[#3ecf8e] bg-[#3ecf8e]/10 text-[#3ecf8e]"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 dark:border-[#282828] dark:bg-[#232323] dark:text-zinc-400 dark:hover:border-[#383838]"
                  }`}
                >
                  {st === "OPEN_TO_JOIN"
                    ? "🟢 Open"
                    : st === "IN_A_PARTY"
                    ? "🟡 In Party"
                    : "⚪ Offline"}
                </button>
              ))}
            </div>
          </div>

          {/* Connected Profiles & Contact */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-[#282828] dark:bg-[#1c1c1c]">
            <div className="mb-3 text-xs font-semibold text-slate-900 dark:text-[#ededed]">
              Student Links
            </div>
            <div className="space-y-2 text-xs text-slate-600 dark:text-zinc-400">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-slate-50 dark:hover:bg-[#232323]"
              >
                <span className="flex items-center gap-2">
                  <Github className="h-4 w-4 text-slate-700 dark:text-zinc-300" />
                  <span>github.com/alexrivera</span>
                </span>
                <span className="text-[10px] text-[#3ecf8e]">Connected</span>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-slate-50 dark:hover:bg-[#232323]"
              >
                <span className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4 text-[#0077b5]" />
                  <span>linkedin.com/in/alexrivera</span>
                </span>
                <span className="text-[10px] text-[#3ecf8e]">Connected</span>
              </a>
              <div className="flex items-center justify-between rounded-lg p-2">
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span>alex.rivera@campus.edu</span>
                </span>
                <span className="text-[10px] text-slate-400">Primary</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Skill Tree */}
      {activeTab === "skilltree" && (
        <div className="animate-in fade-in duration-200">
          <SkillNodeTree nodes={skillTreeNodes} />
        </div>
      )}

      {/* Tab 3: Activity & Badges */}
      {activeTab === "projects" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Reputation / Achievements */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#282828] dark:bg-[#1c1c1c]">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-[#ededed] mb-3">
              Campus Badges & Credentials
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="flex items-center gap-2.5 rounded-lg border border-slate-100 bg-slate-50 p-2.5 dark:border-[#282828] dark:bg-[#232323]">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3ecf8e]/15 text-[#3ecf8e]">
                  <Flame className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100">Hackathon Lead</div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400">3x Winner</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-lg border border-slate-100 bg-slate-50 p-2.5 dark:border-[#282828] dark:bg-[#232323]">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-500">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100">Verified Peer</div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400">CS Department</div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Memberships */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#282828] dark:bg-[#1c1c1c]">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-[#ededed] mb-3">
              Active Quest Parties
            </h3>
            <div className="space-y-2.5">
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-[#282828] dark:bg-[#232323]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                    SideQuest Core Platform
                  </span>
                  <span className="rounded bg-[#3ecf8e]/10 px-2 py-0.5 text-[10px] font-semibold text-[#3ecf8e]">
                    In Progress
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-zinc-400">
                  Role: Backend Lead &middot; Team of 4
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
