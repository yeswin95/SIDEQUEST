"use client";

import { getHighestTier, getTierTokens, SkillRank } from "@/lib/tierConfig";
import { CheckCircle2, Shield, Sparkles } from "lucide-react";

export interface PlayerSkill {
  id: string;
  skillName: string;
  category: string;
  rankTier: SkillRank;
  verified?: boolean;
}

export type ActiveStatus = "OPEN_TO_JOIN" | "IN_A_PARTY" | "OFFLINE";

export interface PlayerProfileCardProps {
  fullName: string;
  major: string;
  gradYear: number;
  activeStatus: ActiveStatus;
  skills: PlayerSkill[];
  bio?: string;
  onStatusChange?: (newStatus: ActiveStatus) => void;
}

const STATUS_CONFIG: Record<
  ActiveStatus,
  { label: string; dot: string; classes: string }
> = {
  OPEN_TO_JOIN: {
    label: "Open to Join Party",
    dot: "bg-[#3ecf8e]",
    classes: "bg-[#3ecf8e]/10 text-[#3ecf8e] border-[#3ecf8e]/30",
  },
  IN_A_PARTY: {
    label: "In Active Party",
    dot: "bg-amber-400",
    classes: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  },
  OFFLINE: {
    label: "Offline",
    dot: "bg-zinc-400",
    classes: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30",
  },
};

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export default function PlayerProfileCard({
  fullName,
  major,
  gradYear,
  activeStatus,
  skills,
  bio,
}: PlayerProfileCardProps) {
  const highest = getHighestTier(skills.map((s) => s.rankTier));
  const highestTokens = getTierTokens(highest);
  const status = STATUS_CONFIG[activeStatus] || STATUS_CONFIG.OPEN_TO_JOIN;
  const verifiedCount = skills.filter((s) => s.verified).length;

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all dark:border-[#282828] dark:bg-[#1c1c1c] dark:shadow-none">
      {/* Header Profile Info */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Avatar with Supabase green accent border */}
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-700 ring-2 ring-[#3ecf8e]/30 dark:bg-[#262626] dark:text-zinc-100">
            {initials(fullName)}
            <span
              className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-[#1c1c1c] ${status.dot}`}
              title={status.label}
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-base font-semibold text-slate-900 dark:text-[#ededed]">
                {fullName}
              </h3>
              <span title="Verified Student">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#3ecf8e]" />
              </span>
            </div>
            <p className="truncate text-xs text-slate-500 dark:text-zinc-400">
              {major} &middot; Class of {gradYear}
            </p>
          </div>
        </div>

        {/* Status Pill */}
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${status.classes}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </div>

      {bio && (
        <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-zinc-400">
          {bio}
        </p>
      )}

      {/* Stats Summary Bar */}
      <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg border border-slate-100 bg-slate-50/80 p-2.5 text-center dark:border-[#282828] dark:bg-[#161616]">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500">Top Tier</div>
          <div className="mt-0.5 flex items-center justify-center gap-1 text-xs font-semibold text-slate-800 dark:text-zinc-200">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: highestTokens.dot }} />
            {highest}
          </div>
        </div>
        <div className="border-x border-slate-200 dark:border-[#282828]">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500">Skills</div>
          <div className="mt-0.5 text-xs font-semibold text-slate-800 dark:text-zinc-200">
            {skills.length} Total
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500">Verified</div>
          <div className="mt-0.5 flex items-center justify-center gap-1 text-xs font-semibold text-[#3ecf8e]">
            <Shield className="h-3 w-3" /> {verifiedCount}
          </div>
        </div>
      </div>

      {/* Skills Matrix Tags */}
      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-medium text-slate-700 dark:text-zinc-300">Skill Matrix</span>
          <span className="text-[11px] text-slate-400 dark:text-zinc-500">{skills.length} nodes</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {skills.map((skill) => {
            const t = getTierTokens(skill.rankTier);
            return (
              <span
                key={skill.id}
                title={`${skill.skillName} (${skill.rankTier})`}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-700 transition-colors hover:border-slate-300 dark:border-[#282828] dark:bg-[#232323] dark:text-zinc-200 dark:hover:border-[#383838]"
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: t.dot }}
                />
                {skill.skillName}
                {skill.verified && (
                  <span title="Peer verified">
                    <Sparkles className="h-2.5 w-2.5 text-[#3ecf8e]" />
                  </span>
                )}
              </span>
            );
          })}
          {skills.length === 0 && (
            <span className="text-xs text-slate-400 dark:text-zinc-500">
              No skills added yet
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
