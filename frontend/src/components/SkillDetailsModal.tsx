"use client";

import { X, CheckCircle2, Lock, ArrowRight, BookOpen, Target } from "lucide-react";
import { Skill } from "@/lib/skillsData";
import { getTierTokens } from "@/lib/tierConfig";

interface SkillDetailsModalProps {
  skill: Skill | null;
  allSkills: Skill[];
  onClose: () => void;
  completed: boolean;
  locked: boolean;
  inGoals: boolean;
  onToggleCompleted: () => void;
  onAddGoal: () => void;
}

export default function SkillDetailsModal({ skill, allSkills, onClose, completed, locked, inGoals, onToggleCompleted, onAddGoal }: SkillDetailsModalProps) {
  if (!skill) return null;

  const findSkill = (id: string) => allSkills.find((s) => s.id === id);
  const nextSkill = skill.nextSkills[0] ? findSkill(skill.nextSkills[0]) : undefined;
  const tokens = skill.rankTier ? getTierTokens(skill.rankTier) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-[#282828] dark:bg-[#1c1c1c]"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tokens?.dot || "#94a3b8" }} />
              <h2 className="text-base font-semibold text-slate-900 dark:text-[#ededed]">{skill.name}</h2>
            </div>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
              {completed ? "Completed" : "Incomplete"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-zinc-500 dark:hover:bg-[#282828] dark:hover:text-zinc-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {locked && <div className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs font-semibold text-amber-700 dark:text-amber-300"><Lock className="h-3.5 w-3.5" />Locked by Prerequisites</div>}

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" disabled={locked && !completed} onClick={onToggleCompleted} className="rounded-lg bg-[#3ecf8e] px-3 py-2 text-xs font-semibold text-[#042f1a] shadow-sm transition-colors hover:bg-[#34b27b] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 dark:disabled:bg-[#282828] dark:disabled:text-zinc-600">{completed ? "Mark as Incomplete" : "Mark as Completed"}</button>
          <button type="button" disabled={inGoals} onClick={onAddGoal} className="rounded-lg border border-[#3ecf8e]/40 px-3 py-2 text-xs font-semibold text-[#21875c] transition-colors hover:bg-[#3ecf8e]/10 disabled:cursor-not-allowed disabled:opacity-50 dark:text-[#3ecf8e]">{inGoals ? "In Goals" : "Add to Goals"}</button>
        </div>

        {skill.prerequisites.length > 0 && (
          <div className="mt-4">
            <h3 className="mb-1.5 text-xs font-semibold text-slate-900 dark:text-[#ededed]">Prerequisites</h3>
            <div className="space-y-1">
              {skill.prerequisites.map((id) => {
                const prereq = findSkill(id);
                const done = prereq?.status === "mastered";
                return (
                  <div key={id} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-zinc-400">
                    {done ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#3ecf8e]" />
                    ) : (
                      <Lock className="h-3.5 w-3.5 text-slate-300 dark:text-zinc-600" />
                    )}
                    {prereq?.name || id}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {skill.goals.length > 0 && (
          <div className="mt-4">
            <h3 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-[#ededed]">
              <Target className="h-3.5 w-3.5 text-[#3ecf8e]" /> Current Goals
            </h3>
            <ul className="space-y-1">
              {skill.goals.map((g) => (
                <li key={g} className="text-xs text-slate-600 dark:text-zinc-400">• {g}</li>
              ))}
            </ul>
          </div>
        )}

        {nextSkill && (
          <div className="mt-4 flex items-center gap-1.5 rounded-lg border border-[#3ecf8e]/20 bg-[#3ecf8e]/5 px-3 py-2 text-xs font-medium text-[#3ecf8e]">
            <ArrowRight className="h-3.5 w-3.5" /> Next Unlock: {nextSkill.name}
          </div>
        )}

        {skill.resources.length > 0 && (
          <div className="mt-4">
            <h3 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-[#ededed]">
              <BookOpen className="h-3.5 w-3.5 text-slate-400" /> Recommended Resources
            </h3>
            <ul className="space-y-1">
              {skill.resources.map((r) => (
                <li key={r} className="text-xs text-slate-600 dark:text-zinc-400">• {r}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
