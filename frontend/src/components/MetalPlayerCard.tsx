"use client";

import { useEffect, useRef, useState } from "react";
import { Lock, Swords, Github, Award, Trophy, Compass, CheckCircle2 } from "lucide-react";
import { getTierTokens, SkillRank } from "@/lib/tierConfig";

export interface PlayerCardConfig {
  tier: SkillRank;
  backgroundType: "default" | "gradient" | "image" | "pattern";
  backgroundImage?: string;
  gradientStart?: string;
  gradientEnd?: string;
  pattern: "carbon" | "brushed" | "circuit" | "minimal" | "holo";
  customTitle?: string;
  showAvatar: boolean;
  showUsername: boolean;
  showLevel: boolean;
  showTier: boolean;
  showMainSkill: boolean;
  showQuestCount: boolean;
  showAchievementCount: boolean;
  showCampusBadgeCount: boolean;
  showGithub: boolean;
}

interface MetalPlayerCardProps {
  config: PlayerCardConfig;
  userData: {
    fullName: string;
    level: number;
    skillsCount: number;
    questsCount: number;
    achievementsCount: number;
    badgesCount: number;
    github?: string;
    avatarUrl?: string;
    mainSkill?: string;
  };
}

const TIER_METALLIC_THEMES: Record<
  SkillRank,
  {
    bgStart: string;
    bgEnd: string;
    border: string;
    text: string;
    accent: string;
    shineColor: string;
    brushedOpacity: number;
  }
> = {
  BRONZE: {
    bgStart: "#3b1e10",
    bgEnd: "#78350f",
    border: "border-amber-700/60 shadow-amber-900/20",
    text: "text-amber-100",
    accent: "text-amber-400 bg-amber-950/40 border-amber-800/40",
    shineColor: "rgba(251, 191, 36, 0.25)",
    brushedOpacity: 0.12,
  },
  SILVER: {
    bgStart: "#1f2937",
    bgEnd: "#4b5563",
    border: "border-slate-500/50 shadow-slate-900/20",
    text: "text-slate-100",
    accent: "text-slate-300 bg-slate-800/40 border-slate-700/40",
    shineColor: "rgba(255, 255, 255, 0.2)",
    brushedOpacity: 0.08,
  },
  GOLD: {
    bgStart: "#451a03",
    bgEnd: "#854d0e",
    border: "border-yellow-600/60 shadow-yellow-900/25",
    text: "text-yellow-50",
    accent: "text-yellow-400 bg-yellow-950/40 border-yellow-800/40",
    shineColor: "rgba(254, 240, 138, 0.3)",
    brushedOpacity: 0.15,
  },
  PLATINUM: {
    bgStart: "#064e3b",
    bgEnd: "#065f46",
    border: "border-[#3ecf8e]/55 shadow-[#3ecf8e]/10",
    text: "text-emerald-50",
    accent: "text-[#3ecf8e] bg-[#022c22]/60 border-[#3ecf8e]/30",
    shineColor: "rgba(112, 229, 179, 0.25)",
    brushedOpacity: 0.1,
  },
  DIAMOND: {
    bgStart: "#1e1b4b",
    bgEnd: "#3730a3",
    border: "border-indigo-500/55 shadow-indigo-950/20",
    text: "text-indigo-50",
    accent: "text-indigo-300 bg-indigo-950/60 border-indigo-700/40",
    shineColor: "rgba(165, 180, 252, 0.35)",
    brushedOpacity: 0.14,
  },
};

export default function MetalPlayerCard({ config, userData }: MetalPlayerCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 50, y: 50 });
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const theme = TIER_METALLIC_THEMES[config.tier] || TIER_METALLIC_THEMES.BRONZE;

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;

    // Calculate rotation (-8deg to +8deg)
    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 8;
    const rotateX = -((y - rect.height / 2) / (rect.height / 2)) * 8;

    setCoords({ x: percentX, y: percentY });
    setRotate({ x: rotateX, y: rotateY });
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  const getBackgroundStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {};

    if (config.backgroundType === "image" && config.backgroundImage) {
      style.backgroundImage = `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(${config.backgroundImage})`;
      style.backgroundSize = "cover";
      style.backgroundPosition = "center";
    } else if (config.backgroundType === "gradient") {
      const start = config.gradientStart || "#1e293b";
      const end = config.gradientEnd || "#0f172a";
      style.background = `linear-gradient(135deg, ${start}, ${end})`;
    } else if (config.backgroundType === "pattern") {
      switch (config.pattern) {
        case "carbon":
          style.backgroundColor = "#151515";
          style.backgroundImage = `
            linear-gradient(45deg, #0a0a0a 25%, transparent 25%), 
            linear-gradient(-45deg, #0a0a0a 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, #0a0a0a 75%), 
            linear-gradient(-45deg, transparent 75%, #0a0a0a 75%)
          `;
          style.backgroundSize = "8px 8px";
          break;
        case "brushed":
          style.background = `
            repeating-linear-gradient(90deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 8px),
            linear-gradient(135deg, ${theme.bgStart}, ${theme.bgEnd})
          `;
          break;
        case "holo":
          style.background = `
            linear-gradient(135deg, rgba(255,0,127,0.15), rgba(127,0,255,0.15), rgba(0,255,255,0.15), rgba(127,0,255,0.15)),
            linear-gradient(135deg, ${theme.bgStart}, ${theme.bgEnd})
          `;
          break;
        case "circuit":
        default:
          style.background = `linear-gradient(135deg, ${theme.bgStart}, ${theme.bgEnd})`;
          break;
      }
    } else {
      style.background = `linear-gradient(135deg, ${theme.bgStart}, ${theme.bgEnd})`;
    }

    return style;
  };

  const getInitials = (name: string) => {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("");
  };

  // Generate Player ID
  const playerId = `#SQ-${String(userData.fullName.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) + 127).padStart(5, "0")}`;

  return (
    <div className="relative select-none w-full max-w-[380px] perspective-[1000px] mx-auto z-10">
      {/* SVG Noise filter for metal texture */}
      <svg className="absolute w-0 h-0 pointer-events-none">
        <defs>
          <filter id="metalNoise">
            <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.08 0" />
          </filter>
        </defs>
      </svg>

      <div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={handlePointerLeave}
        style={{
          transform: isHovered
            ? `rotateY(${rotate.y}deg) rotateX(${rotate.x}deg) scale(1.02)`
            : "rotateY(0deg) rotateX(0deg) scale(1)",
          transition: isHovered ? "none" : "transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1), shadow 0.5s",
          ...getBackgroundStyle(),
        }}
        className={`relative aspect-[1.586] w-full rounded-2xl border-2 p-5 flex flex-col justify-between overflow-hidden shadow-lg ${theme.border} text-white`}
      >
        {/* Layer 1: Brushed Metal Line Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.25] pointer-events-none mix-blend-overlay bg-[linear-gradient(90deg,rgba(255,255,255,0.03)_0%,rgba(0,0,0,0.03)_100%)] bg-[size:3px_100%]" />

        {/* Layer 2: Noise Texture */}
        <div 
          className="absolute inset-0 pointer-events-none mix-blend-overlay"
          style={{ filter: "url(#metalNoise)" }}
        />

        {/* Layer 3: Circuit Board SVG Pattern Overlay */}
        {config.backgroundType === "pattern" && config.pattern === "circuit" && (
          <div className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <pattern id="circuit-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M0,20 H40 M20,0 V40 M10,10 H30 V30 H10 Z M5,5 H15 M25,25 H35 M35,5 V15" stroke="currentColor" strokeWidth="1" fill="none" />
                <circle cx="20" cy="20" r="2.5" fill="currentColor" />
                <circle cx="10" cy="10" r="1.5" fill="currentColor" />
                <circle cx="30" cy="30" r="1.5" fill="currentColor" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#circuit-pattern)" />
            </svg>
          </div>
        )}

        {/* Layer 4: Interactive Specular Shine Reflection Layer */}
        {isHovered && (
          <div
            className="absolute inset-0 pointer-events-none mix-blend-color-dodge transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle 180px at ${coords.x}% ${coords.y}%, ${theme.shineColor} 0%, transparent 80%)`,
            }}
          />
        )}

        {/* Layer 5: Rarity-based holographic overlay (for Platinum / Diamond) */}
        {config.backgroundType === "pattern" && config.pattern === "holo" && (
          <div
            className="absolute inset-0 pointer-events-none mix-blend-color-dodge opacity-[0.25]"
            style={{
              background: `linear-gradient(${isHovered ? coords.x + coords.y : 135}deg, #ff007f, #7f00ff, #00ffff, #ff007f)`,
              backgroundSize: "200% 200%",
            }}
          />
        )}

        {/* Top Section: Branding + Level */}
        <div className="relative flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5 opacity-90">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-[#3ecf8e]/20 text-[#3ecf8e]">
              <Swords className="h-3 w-3" />
            </div>
            <span className="text-[10px] font-black tracking-widest uppercase text-slate-100/90">
              SIDEQUEST
            </span>
          </div>

          {config.showLevel && (
            <div className="text-[10px] font-bold tracking-wider text-slate-200">
              LV. <span className="text-sm font-extrabold text-white">{userData.level}</span>
            </div>
          )}
        </div>

        {/* Middle Section: Avatar + Name / Title */}
        <div className="relative flex items-center gap-3.5 z-10 my-auto">
          {config.showAvatar && (
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-900/50 font-bold border border-white/20 text-slate-100 overflow-hidden shadow-inner backdrop-blur-sm">
              {userData.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={userData.avatarUrl} alt={userData.fullName} className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm tracking-wider">{getInitials(userData.fullName)}</span>
              )}
            </div>
          )}

          <div className="min-w-0">
            {config.showUsername && (
              <div className="flex items-center gap-1">
                <span className={`text-sm font-extrabold tracking-wide uppercase truncate ${theme.text}`}>
                  {userData.fullName}
                </span>
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#3ecf8e]" />
              </div>
            )}

            {config.customTitle && (
              <p className="text-[10px] font-medium text-slate-300 leading-tight uppercase tracking-wider truncate max-w-[200px]">
                {config.customTitle}
              </p>
            )}

            {config.showMainSkill && userData.mainSkill && (
              <span className={`inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${theme.accent}`}>
                {userData.mainSkill}
              </span>
            )}
          </div>
        </div>

        {/* Bottom Section: Stats + Rank */}
        <div className="relative flex items-end justify-between z-10">
          <div className="flex gap-4">
            {config.showQuestCount && (
              <div>
                <div className="text-[8px] uppercase tracking-widest text-slate-300">Quests</div>
                <div className="text-xs font-black flex items-center gap-1 text-white">
                  <Trophy className="h-3 w-3 text-[#3ecf8e]" /> {userData.questsCount}
                </div>
              </div>
            )}

            {config.showAchievementCount && (
              <div>
                <div className="text-[8px] uppercase tracking-widest text-slate-300">Achievements</div>
                <div className="text-xs font-black flex items-center gap-1 text-white">
                  <Award className="h-3 w-3 text-amber-400" /> {userData.achievementsCount}
                </div>
              </div>
            )}

            {config.showCampusBadgeCount && (
              <div>
                <div className="text-[8px] uppercase tracking-widest text-slate-300">Badges</div>
                <div className="text-xs font-black flex items-center gap-1 text-white">
                  <Compass className="h-3 w-3 text-cyan-400" /> {userData.badgesCount}
                </div>
              </div>
            )}
          </div>

          <div className="text-right">
            {config.showTier && (
              <div className="text-[8px] uppercase tracking-widest text-slate-300">Rank</div>
            )}
            <div className="text-[10px] font-black uppercase tracking-widest text-[#3ecf8e]">
              {config.tier}
            </div>
            <div className="text-[8px] opacity-50 tracking-wider font-mono mt-0.5">
              {playerId}
            </div>
          </div>
        </div>

        {/* Card outer embedded border lines */}
        <div className="absolute inset-1.5 rounded-[10px] border border-white/5 pointer-events-none" />
      </div>
    </div>
  );
}
