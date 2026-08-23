"use client";

import { LearningPath, pathProgress } from "@/lib/skillsData";

export interface LearningPathCardProps {
  path: LearningPath;
  isActive: boolean;
  onSelect: () => void;
}

export default function LearningPathCard({ path, isActive, onSelect }: LearningPathCardProps) {
  const progress = pathProgress(path);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`shrink-0 w-56 rounded-xl border p-3.5 text-left transition-all ${
        isActive
          ? "border-[#3ecf8e] bg-[#3ecf8e]/5 dark:bg-[#3ecf8e]/10"
          : "border-slate-200 bg-white hover:border-slate-300 dark:border-[#282828] dark:bg-[#1c1c1c] dark:hover:border-[#383838]"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-lg">{path.icon}</span>
        <span className={`text-[11px] font-semibold ${isActive ? "text-[#3ecf8e]" : "text-slate-400 dark:text-zinc-500"}`}>
          {progress}%
        </span>
      </div>
      <div className="mt-2 text-xs font-semibold text-slate-900 dark:text-[#ededed]">{path.name}</div>
      <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-500 dark:text-zinc-400">{path.description}</p>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-[#282828]">
        <div
          className={`h-full rounded-full transition-all ${isActive ? "bg-[#3ecf8e]" : "bg-slate-400 dark:bg-zinc-600"}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </button>
  );
}