"use client";

import * as Icons from "lucide-react";
import { Achievement } from "@/lib/skillsData";

export default function AchievementCard({ achievement }: { achievement: Achievement }) {
  const Icon = (Icons as any)[achievement.icon] || Icons.Award;
  const earned = achievement.status === "earned";

  return (
    <div
      title={achievement.description}
      className={`group flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-all hover:-translate-y-0.5 hover:shadow-sm ${
        earned
          ? "border-[#3ecf8e]/30 bg-[#3ecf8e]/5"
          : "border-slate-100 bg-slate-50 opacity-60 dark:border-[#282828] dark:bg-[#161616]"
      }`}
    >
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-full transition-transform group-hover:scale-110 ${
          earned ? "bg-[#3ecf8e]/15 text-[#3ecf8e]" : "bg-slate-200/60 text-slate-400 dark:bg-[#232323] dark:text-zinc-500"
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-[10px] font-semibold leading-tight text-slate-700 dark:text-zinc-300">
        {achievement.title}
      </span>
      {!earned && achievement.progress > 0 && (
        <span className="text-[9px] text-slate-400 dark:text-zinc-500">{achievement.progress}%</span>
      )}
    </div>
  );
}