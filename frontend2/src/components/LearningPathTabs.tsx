"use client";

import { learningPaths } from "@/lib/skillsData";

interface LearningPathTabsProps {
  activePathId: string;
  onSelect: (id: string) => void;
}

export default function LearningPathTabs({ activePathId, onSelect }: LearningPathTabsProps) {
  return (
    <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-[#282828] dark:bg-[#1c1c1c]">
      {learningPaths.map((path) => {
        const isActive = path.id === activePathId;
        return (
          <button
            key={path.id}
            type="button"
            onClick={() => onSelect(path.id)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              isActive
                ? "bg-[#3ecf8e] text-[#042f1a] shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 dark:bg-[#232323] dark:text-zinc-400 dark:hover:bg-[#2c2c2c]"
            }`}
          >
            {path.label}
          </button>
        );
      })}
    </div>
  );
}