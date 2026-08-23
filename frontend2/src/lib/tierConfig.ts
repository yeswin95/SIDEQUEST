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
