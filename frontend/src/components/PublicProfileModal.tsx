"use client";

import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import PlayerProfileCard, { PlayerSkill } from "@/components/PlayerProfileCard";
import MetalPlayerCard from "@/components/MetalPlayerCard";
import BadgeGrid from "@/components/achievements/BadgeGrid";
import { mockAchievements, mockCampusBadges } from "@/lib/skillsData";
import { getHighestTier, getLevelFromSkills, getTierTokens } from "@/lib/tierConfig";

interface Props {
  userId: string | null;
  onClose: () => void;
}

export default function PublicProfileModal({ userId, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError("");
    api.profiles.getById(userId)
      .then((res) => setProfile(res))
      .catch((e) => setError(e.message || "Failed to load profile"))
      .finally(() => setLoading(false));
  }, [userId]);

  if (!userId) return null;

  const skills: PlayerSkill[] = (profile?.skills || []).map((s: any) => ({
    id: s.id || s.skillId,
    skillName: s.skillName,
    category: s.category,
    rankTier: s.rankTier || "BRONZE",
    verified: s.verificationStatus === "VERIFIED",
  }));

  const level = getLevelFromSkills(skills.length);
  const highest = getHighestTier(skills.map(s => s.rankTier));
  const isNew = skills.length === 0;

  const achievements = isNew
    ? mockAchievements.map(b => ({ ...b, status: "locked" as const, progress: 0, currentValue: 0 }))
    : mockAchievements;
  const badges = isNew
    ? mockCampusBadges.map(b => ({ ...b, status: "locked" as const, progress: 0, currentValue: 0 }))
    : mockCampusBadges;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-2xl bg-[#f8fafc] dark:bg-[#121212] shadow-2xl flex flex-col">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-[#f8fafc] dark:border-[#282828] dark:bg-[#121212] px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-[#ededed]">Public Profile</h2>
          <button type="button" onClick={onClose} className="rounded-full bg-white p-2 text-slate-500 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900 dark:bg-[#1c1c1c] dark:text-zinc-400 dark:ring-[#282828] dark:hover:bg-[#232323] dark:hover:text-zinc-100" aria-label="Close profile"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-[#3ecf8e]" /></div>
        ) : error ? (
          <p className="mt-4 text-sm text-rose-600">{error}</p>
        ) : profile ? (
          <div className="mt-4 space-y-6">
            <div className="flex justify-center">
              <MetalPlayerCard
                config={{
                  tier: (profile.rankTier as any) || highest,
                  backgroundType: "default",
                  pattern: "circuit",
                  showAvatar: true,
                  showUsername: true,
                  showLevel: true,
                  showTier: true,
                  showMainSkill: true,
                  showQuestCount: true,
                  showAchievementCount: true,
                  showCampusBadgeCount: true,
                  showGithub: true,
                  customTitle: profile.major || "Student Builder",
                }}
                userData={{
                  fullName: profile.fullName,
                  level,
                  skillsCount: skills.length,
                  questsCount: isNew ? 0 : 5,
                  achievementsCount: achievements.filter(b => b.status === "earned").length,
                  badgesCount: badges.filter(b => b.status === "earned").length,
                  mainSkill: skills[0]?.skillName,
                }}
              />
            </div>
            <PlayerProfileCard
              fullName={profile.fullName}
              major={profile.major}
              activeStatus={
                profile.activeStatus === "IN_A_PARTY" ? "IN_A_PARTY" :
                profile.activeStatus === "INACTIVE" ? "OFFLINE" : "OPEN_TO_JOIN"
              }
              skills={skills}
              bio={isNew ? "New builder — just getting started!" : `${profile.fullName} — ${skills.length} skills unlocked`}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-[#282828] dark:bg-[#1c1c1c]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-200 mb-3">Achievements</h3>
                <BadgeGrid badges={achievements.slice(0, 6)} unfilteredBadges={achievements} />
              </section>
              <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-[#282828] dark:bg-[#1c1c1c]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-200 mb-3">Campus Badges</h3>
                <BadgeGrid badges={badges.slice(0, 6)} unfilteredBadges={badges} />
              </section>
            </div>
            {skills.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-[#282828] dark:bg-[#1c1c1c]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-200 mb-2">Completed Skills ({skills.length})</h3>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map(s => (
                    <span key={s.id} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] dark:border-[#282828] dark:bg-[#232323]">{s.skillName} · {s.rankTier}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
        </div>
      </div>
    </div>
  );
}
