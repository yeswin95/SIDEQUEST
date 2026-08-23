"use client";

import { Achievement } from "@/lib/skillsData";
import BadgeGrid from "./achievements/BadgeGrid";

export default function AchievementsSection({ achievements }: { achievements: Achievement[] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#282828] dark:bg-[#1c1c1c]">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-[#ededed] mb-4">Achievements</h3>
      <BadgeGrid badges={achievements} />
    </div>
  );
}