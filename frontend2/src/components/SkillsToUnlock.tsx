"use client";

import { Lock, CheckCircle2, Circle } from "lucide-react";
import { Skill, mockSkills } from "@/lib/skillsData";

export interface SkillsToUnlockProps {
  skills: Skill[];
  onSelect: (id: string) => void;
}

function getPrereqChecks(skill: Skill) {
  return skill.prerequisites.map((prereqId) => {
    const prereq = mockSkills.find((s) => s.id === prereqId);
    return {
      id: prereqId,
      name: prereq ? prereq.name : prereqId,
      met: prereq ? prereq.status === "mastered" : false,
    };
  });
}

export default function SkillsToUnlock({ skills, onSelect }: SkillsToUnlockProps) {
  const lockedSkills = skills.filter((s) => s.status === "locked");

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#282828] dark:bg-[#1c1c1c]">
      <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-[#ededed]">Skills to Unlock</h3>

      <div className="space-y-3">
        {lockedSkills.map((skill) => {
          const checks = getPrereqChecks(skill);
          return (
            <button
              key={skill.id}
              type="button"
              onClick={() => onSelect(skill.id)}
              className="w-full rounded-lg border border-slate-100 bg-slate-50/70 p-3 text-left opacity-90 transition-colors hover:border-slate-200 hover:opacity-100 dark:border-[#282828] dark:bg-[#161616] dark:hover:border-[#383838]"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                <Lock className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
                {skill.name}
              </div>
              <div className="mt-1.5 text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Requires
              </div>
              <ul className="mt-1 space-y-0.5">
                {checks.map((c) => (
                  <li key={c.id} className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400">
                    {c.met ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#3ecf8e]" />
                    ) : (
                      <Circle className="h-3 w-3 shrink-0 text-slate-300 dark:text-zinc-600" />
                    )}
                    {c.name}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}

        {lockedSkills.length === 0 && (
          <p className="py-4 text-center text-xs text-slate-400 dark:text-zinc-500">
            Nothing locked here right now — nice work!
          </p>
        )}
      </div>
    </div>
  );
}