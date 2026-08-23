"use client";

import React from "react";
import * as Icons from "lucide-react";
import { RarityType, ShapeType } from "@/lib/skillsData";

interface BadgeArtworkProps {
  rarity: RarityType;
  shape: ShapeType;
  status: "locked" | "in-progress" | "in_progress" | "earned";
  progress: number;
  icon: string;
  size?: number;
  glow?: boolean;
  isCampus?: boolean;
}

// SVG Path definitions for outer silhouettes (scaled within 100x100 viewBox with padding)
export const SHAPE_PATHS: Record<ShapeType, string> = {
  hexagon: "M 50 6 L 90 29 L 90 71 L 50 94 L 10 71 L 10 29 Z",
  shield: "M 50 6 C 78 6, 88 15, 88 45 C 88 72, 74 88, 50 95 C 26 88, 12 72, 12 45 C 12 15, 22 6, 50 6 Z",
  octagon: "M 32 6 L 68 6 L 92 30 L 92 70 L 68 94 L 32 94 L 8 70 L 8 30 Z",
  medal: "M 50 6 C 75 6, 92 22, 92 48 C 92 72, 75 94, 50 94 C 25 94, 8 72, 8 48 C 8 22, 25 6, 50 6 Z",
  crest: "M 50 6 C 72 6, 92 14, 90 42 C 88 72, 70 88, 50 95 C 30 88, 12 72, 10 42 C 8 14, 28 6, 50 6 Z",
  diamond: "M 50 6 L 92 50 L 50 94 L 8 50 Z",
};

// SVG Path definitions for inner plates (scaled slightly smaller to create the rim)
export const INNER_PATHS: Record<ShapeType, string> = {
  hexagon: "M 50 12 L 84 32 L 84 68 L 50 88 L 16 68 L 16 32 Z",
  shield: "M 50 12 C 72 12, 82 20, 82 45 C 82 68, 70 82, 50 89 C 30 82, 18 68, 18 45 C 18 20, 28 12, 50 12 Z",
  octagon: "M 34 12 L 66 12 L 86 32 L 86 68 L 66 88 L 34 88 L 14 68 L 14 32 Z",
  medal: "M 50 12 C 70 12, 84 26, 84 48 C 84 70, 70 88, 50 88 C 30 88, 16 70, 16 48 C 16 26, 30 12, 50 12 Z",
  crest: "M 50 12 C 68 12, 84 18, 83 42 C 81 66, 66 81, 50 88 C 34 81, 19 66, 17 42 C 16 18, 32 12, 50 12 Z",
  diamond: "M 50 12 L 84 50 L 50 88 L 16 50 Z",
};

export default function BadgeArtwork({
  rarity,
  shape,
  status,
  progress,
  icon,
  size = 120,
  glow = false,
  isCampus = false,
}: BadgeArtworkProps) {
  const isLocked = status === "locked";
  const isInProgress = status === "in-progress" || status === "in_progress";
  const isEarned = status === "earned";

  // Pick Lucide emblem
  const IconComponent = (Icons as any)[icon] || Icons.Award;

  // Path strings
  const outerPath = SHAPE_PATHS[shape] || SHAPE_PATHS.hexagon;
  const innerPath = INNER_PATHS[shape] || SHAPE_PATHS.hexagon;

  // Rarity styling variables
  let rimColor = "url(#rim-common)";
  let plateColor = "url(#plate-common)";
  let strokeColor = "#475569";
  let glowColor = "rgba(100, 116, 139, 0.2)";
  let emblemFill = "url(#emblem-common)";

  if (isLocked) {
    rimColor = "url(#rim-locked)";
    plateColor = "url(#plate-locked)";
    strokeColor = "#27272a";
    emblemFill = "#52525b";
  } else {
    switch (rarity) {
      case "COMMON":
        rimColor = "url(#rim-common)";
        plateColor = "url(#plate-common)";
        strokeColor = "#475569";
        glowColor = "rgba(71, 85, 105, 0.25)";
        emblemFill = "url(#emblem-common)";
        break;
      case "UNCOMMON":
        rimColor = "url(#rim-uncommon)";
        plateColor = "url(#plate-uncommon)";
        strokeColor = "#64748b";
        glowColor = "rgba(148, 163, 184, 0.3)";
        emblemFill = "url(#emblem-uncommon)";
        break;
      case "RARE":
        rimColor = "url(#rim-rare)";
        plateColor = "url(#plate-rare)";
        strokeColor = "#0284c7";
        glowColor = "rgba(14, 165, 233, 0.45)";
        emblemFill = "url(#emblem-rare)";
        break;
      case "EPIC":
        rimColor = "url(#rim-epic)";
        plateColor = "url(#plate-epic)";
        strokeColor = "#d97706";
        glowColor = "rgba(245, 158, 11, 0.5)";
        emblemFill = "url(#emblem-epic)";
        break;
      case "LEGENDARY":
        rimColor = "url(#rim-legendary)";
        plateColor = "url(#plate-legendary)";
        strokeColor = "#0d9488";
        glowColor = "rgba(45, 212, 191, 0.6)";
        emblemFill = "url(#emblem-legendary)";
        break;
      case "MYTHIC":
        rimColor = "url(#rim-mythic)";
        plateColor = "url(#plate-mythic)";
        strokeColor = "#7c3aed";
        glowColor = "rgba(192, 132, 252, 0.7)";
        emblemFill = "url(#emblem-mythic)";
        break;
    }
  }

  // Outline perimeter for progress bar (approximate value for stroke-dasharray)
  const perimeter = 300;
  const strokeDashoffset = perimeter - (perimeter * (isEarned ? 100 : progress)) / 100;

  // Custom glows depending on rarity
  const glowStyle = (glow || isEarned) && !isLocked
    ? { filter: `drop-shadow(0 0 8px ${glowColor}) drop-shadow(0 4px 12px rgba(0,0,0,0.3))` }
    : { filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.25))" };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={glowStyle}
      className={`relative overflow-visible transition-all duration-300 select-none`}
    >
      <defs>
        {/* Metal Gradients */}
        {/* Locked */}
        <radialGradient id="rim-locked" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3f3f46" />
          <stop offset="100%" stopColor="#18181b" />
        </radialGradient>
        <radialGradient id="plate-locked" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#18181b" />
          <stop offset="100%" stopColor="#09090b" />
        </radialGradient>

        {/* Common: Iron */}
        <linearGradient id="rim-common" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#64748b" />
          <stop offset="35%" stopColor="#334155" />
          <stop offset="65%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <radialGradient id="plate-common" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#334155" stopOpacity={0.9} />
          <stop offset="100%" stopColor="#0f172a" />
        </radialGradient>
        <linearGradient id="emblem-common" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>

        {/* Uncommon: Steel */}
        <linearGradient id="rim-uncommon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="25%" stopColor="#475569" />
          <stop offset="75%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
        <radialGradient id="plate-uncommon" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#475569" stopOpacity={0.9} />
          <stop offset="100%" stopColor="#1e293b" />
        </radialGradient>
        <linearGradient id="emblem-uncommon" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>

        {/* Rare: Chrome / Silver */}
        <linearGradient id="rim-rare" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="20%" stopColor="#cbd5e1" />
          <stop offset="50%" stopColor="#38bdf8" />
          <stop offset="80%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
        <radialGradient id="plate-rare" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="70%" stopColor="#0369a1" stopOpacity={0.15} />
          <stop offset="100%" stopColor="#082f49" />
        </radialGradient>
        <linearGradient id="emblem-rare" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#bae6fd" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>

        {/* Epic: Gold */}
        <linearGradient id="rim-epic" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="25%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="75%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
        <radialGradient id="plate-epic" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="80%" stopColor="#78350f" stopOpacity={0.2} />
          <stop offset="100%" stopColor="#451a03" />
        </radialGradient>
        <linearGradient id="emblem-epic" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        {/* Legendary: Platinum */}
        <linearGradient id="rim-legendary" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor="#94a3b8" />
          <stop offset="50%" stopColor="#2dd4bf" />
          <stop offset="70%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#115e59" />
        </linearGradient>
        <radialGradient id="plate-legendary" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#042f2e" />
          <stop offset="80%" stopColor="#115e59" stopOpacity={0.25} />
          <stop offset="100%" stopColor="#022c22" />
        </radialGradient>
        <linearGradient id="emblem-legendary" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f0fdfa" />
          <stop offset="50%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>

        {/* Mythic: Cosmic Aurora */}
        <linearGradient id="rim-mythic" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="30%" stopColor="#f43f5e" />
          <stop offset="50%" stopColor="#22d3ee" />
          <stop offset="70%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#311042" />
        </linearGradient>
        <radialGradient id="plate-mythic" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1e102f" />
          <stop offset="60%" stopColor="#7c3aed" stopOpacity={0.15} />
          <stop offset="100%" stopColor="#0a0512" />
        </radialGradient>
        <linearGradient id="emblem-mythic" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f5f3ff" />
          <stop offset="50%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>

        {/* Technical/Circuit Pattern Overlay */}
        <pattern id="technical-grid" width="6" height="6" patternUnits="userSpaceOnUse">
          <path d="M 6 0 L 0 0 0 6" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
          <circle cx="3" cy="3" r="0.5" fill="rgba(255,255,255,0.06)" />
        </pattern>
      </defs>

      {/* Layer 1: Outer Rim Silhouette */}
      <path
        d={outerPath}
        fill={rimColor}
        stroke={isLocked ? "#3f3f46" : strokeColor}
        strokeWidth="1.5"
      />

      {/* Outer rim double line effect (light reflection inlay) */}
      <path
        d={outerPath}
        fill="none"
        stroke="rgba(255, 255, 255, 0.15)"
        strokeWidth="0.75"
        transform="scale(0.96) translate(2, 2)"
        style={{ mixBlendMode: "overlay" }}
      />

      {/* Layer 2: Inner Plate */}
      <path
        d={innerPath}
        fill={plateColor}
        stroke="rgba(0,0,0,0.4)"
        strokeWidth="1.2"
      />

      {/* Technical Grid Pattern Overlay on Plate */}
      {!isLocked && (
        <path
          d={innerPath}
          fill="url(#technical-grid)"
          style={{ mixBlendMode: "overlay" }}
        />
      )}

      {/* Dynamic Metallic Light Sweep for high rarities */}
      {isEarned && (rarity === "LEGENDARY" || rarity === "MYTHIC") && (
        <path
          d={innerPath}
          fill="url(#rim-mythic)"
          opacity="0.12"
          style={{ mixBlendMode: "color-dodge" }}
          className="animate-pulse"
        />
      )}

      {/* Layer 3: Central Emblem */}
      <g transform="translate(50, 50) scale(0.9)" className="transition-transform duration-300">
        {/* Emblem shadow / engraving bevel */}
        <g transform="translate(0, 1.2)" opacity="0.65">
          <IconComponent
            className="h-10 w-10 text-black"
            style={{ transform: "translate(-20px, -20px)" }}
            strokeWidth={2.5}
          />
        </g>

        {/* Dynamic colored emblem */}
        <IconComponent
          className="h-10 w-10"
          style={{
            transform: "translate(-20px, -20px)",
            color: isLocked ? "#52525b" : "currentColor"
          }}
          strokeWidth={2.2}
          fill={isLocked ? "none" : emblemFill.startsWith("url") ? emblemFill : "none"}
          stroke={isLocked ? "#3f3f46" : emblemFill}
        />

        {/* Small lock overlay for locked state */}
        {isLocked && (
          <g transform="translate(0, 10) scale(0.6)">
            <circle cx="0" cy="0" r="10" fill="#18181b" stroke="#3f3f46" strokeWidth="1.5" />
            <Icons.Lock
              className="h-3 w-3 text-zinc-500"
              style={{ transform: "translate(-6px, -6px)" }}
              strokeWidth={2.5}
            />
          </g>
        )}
      </g>

      {/* Layer 4: Contour-following Progress Ring */}
      {isInProgress && !isLocked && (
        <path
          d={outerPath}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeDasharray={perimeter}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="drop-shadow-[0_0_4px_currentColor]"
          style={{
            color: strokeColor,
            transformOrigin: "50% 50%",
            transform: "rotate(-90deg) scale(1.04) translate(-2, -2)",
          }}
        />
      )}

      {/* Subtle details overlay: Campus badge indicator */}
      {isCampus && !isLocked && (
        <g transform="translate(50, 85) scale(0.8)">
          <polygon points="0,-4 4,4 -4,4" fill={strokeColor} opacity="0.8" />
        </g>
      )}
    </svg>
  );
}
