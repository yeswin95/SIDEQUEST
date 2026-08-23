"use client";

import { Lock } from "lucide-react";
import { CampusBadge } from "@/lib/skillsData";

export default function CampusBadgeCard({ badge }: { badge: CampusBadge }) {
  const { title, description, icon, status, progress, earnedDate } = badge;

  return (
    <div
      className={`rounded-lg border p-3 text-center transition-all ${
        status === "locked"
          ? "border-slate-100 bg-slate-50 opacity-60 dark:border-[#282828] dark:bg-[#161616]"
          : "border-slate-200 bg-white hover:border-slate-300 dark:border-[#282828] dark:bg-[#1c1c1c] dark:hover:border-[#383838]"
      }`}
    >
      <div
        className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full text-lg ${
          status === "earned" ? "bg-[#3ecf8e]/15" : "bg-slate-100 dark:bg-[#232323]"
        }`}
      >
        {status === "locked" ? <Lock className="h-4 w-4 text-slate-400 dark:text-zinc-500" /> : icon}
      </div>
      <div className="mt-2 text-xs font-semibold text-slate-900 dark:text-zinc-100">{title}</div>
      <p className="mt-0.5 text-[10px] leading-snug text-slate-500 dark:text-zinc-400">{description}</p>

      {status === "in_progress" && typeof progress === "number" && (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-[#282828]">
          <div className="h-full rounded-full bg-[#3ecf8e]" style={{ width: `${progress}%` }} />
        </div>
      )}

      {status === "earned" && earnedDate && (
        <div className="mt-1.5 text-[9px] font-medium text-[#3ecf8e]">
          {new Date(earnedDate).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
        </div>
      )}
    </div>
  );
}