export type SkillRank = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND";

export interface TierTokens {
  label: SkillRank;
  dot: string;
  badgeBg: string;
  badgeText: string;
}

export const TIER_ORDER: SkillRank[] = [
  "BRONZE",
  "SILVER",
  "GOLD",
  "PLATINUM",
  "DIAMOND",
];

export const TIER_TOKENS: Record<SkillRank, TierTokens> = {
  BRONZE: {
    label: "BRONZE",
    dot: "#b07a3c",
    badgeBg: "rgba(176, 122, 60, 0.15)",
    badgeText: "#f5d0a0",
  },
  SILVER: {
    label: "SILVER",
    dot: "#a8a9ad",
    badgeBg: "rgba(168, 169, 173, 0.15)",
    badgeText: "#e5e7eb",
  },
  GOLD: {
    label: "GOLD",
    dot: "#d4af37",
    badgeBg: "rgba(212, 175, 55, 0.15)",
    badgeText: "#fde68a",
  },
  PLATINUM: {
    label: "PLATINUM",
    dot: "#e5e4e2",
    badgeBg: "rgba(229, 228, 226, 0.15)",
    badgeText: "#f8fafc",
  },
  DIAMOND: {
    label: "DIAMOND",
    dot: "#d8e6ff",
    badgeBg: "rgba(216, 230, 255, 0.15)",
    badgeText: "#c7d2fe",
  },
};

export function getTierTokens(rank: SkillRank = "BRONZE"): TierTokens {
  return TIER_TOKENS[rank] || TIER_TOKENS.BRONZE;
}

export function getHighestTier(ranks: SkillRank[]): SkillRank {
  if (!ranks || ranks.length === 0) return "BRONZE";
  return ranks.reduce((highest, current) =>
    TIER_ORDER.indexOf(current) > TIER_ORDER.indexOf(highest) ? current : highest
  );
}

// ---------------------------------------------------------------------------
// Rank Unlocking Progression — locked higher ranks, unlocked by skill count
// ---------------------------------------------------------------------------
export const RANK_UNLOCK_THRESHOLDS: Record<SkillRank, number> = {
  BRONZE: 0,
  SILVER: 3,
  GOLD: 6,
  PLATINUM: 10,
  DIAMOND: 15,
};

export function isRankUnlocked(rank: SkillRank, completedCount: number): boolean {
  return completedCount >= (RANK_UNLOCK_THRESHOLDS[rank] ?? 0);
}

export function getUnlockedRanks(completedCount: number): SkillRank[] {
  return TIER_ORDER.filter((rank) => isRankUnlocked(rank, completedCount));
}

export function getNextRankToUnlock(completedCount: number): SkillRank | null {
  for (const rank of TIER_ORDER) {
    if (!isRankUnlocked(rank, completedCount)) return rank;
  }
  return null;
}

export function getRankProgress(completedCount: number): { currentRank: SkillRank; nextRank: SkillRank | null; progress: number; required: number } {
  const unlocked = getUnlockedRanks(completedCount);
  const currentRank = unlocked.length ? unlocked[unlocked.length - 1] : "BRONZE";
  const nextRank = getNextRankToUnlock(completedCount);
  const required = nextRank ? RANK_UNLOCK_THRESHOLDS[nextRank] : RANK_UNLOCK_THRESHOLDS["DIAMOND"];
  const prevThreshold = RANK_UNLOCK_THRESHOLDS[currentRank] ?? 0;
  const progress = nextRank ? Math.min(100, Math.round(((completedCount - prevThreshold) / (required - prevThreshold)) * 100)) : 100;
  return { currentRank, nextRank, progress, required };
}
