"use client";

import React from "react";
import { X, Calendar, Award, Compass, RefreshCw, BarChart2 } from "lucide-react";
import { Badge as BadgeType, RarityType } from "@/lib/skillsData";
import BadgeArtwork from "./BadgeArtwork";

interface BadgeDetailModalProps {
  badge: BadgeType | null;
  onClose: () => void;
}

export default function BadgeDetailModal({ badge, onClose }: BadgeDetailModalProps) {
  if (!badge) return null;

  const {
    title,
    description,
    rarity,
    shape,
    status,
    progress,
    icon,
    earnedDate,
    category,
    isCampus,
    currentValue,
    maxValue,
    stages,
  } = badge;

  const isEarned = status === "earned";
  const isLocked = status === "locked";
  const isInProgress = status === "in-progress" || status === "in_progress";

  // Determine border and text styling depending on rarity
  let rarityTextColor = "text-slate-400 dark:text-zinc-500";
  let rarityBorderColor = "border-slate-200 dark:border-zinc-800";
  let glowEffect = "";

  switch (rarity) {
    case "COMMON":
      rarityTextColor = "text-slate-500 dark:text-zinc-400";
      break;
    case "UNCOMMON":
      rarityTextColor = "text-slate-600 dark:text-slate-300";
      break;
    case "RARE":
      rarityTextColor = "text-sky-500 dark:text-sky-400";
      rarityBorderColor = "border-sky-500/20";
      glowEffect = "shadow-[0_0_15px_rgba(14,165,233,0.15)]";
      break;
    case "EPIC":
      rarityTextColor = "text-amber-500 dark:text-amber-400";
      rarityBorderColor = "border-amber-500/30";
      glowEffect = "shadow-[0_0_20px_rgba(245,158,11,0.2)]";
      break;
    case "LEGENDARY":
      rarityTextColor = "text-teal-500 dark:text-teal-400";
      rarityBorderColor = "border-teal-500/30";
      glowEffect = "shadow-[0_0_25px_rgba(45,212,191,0.25)]";
      break;
    case "MYTHIC":
      rarityTextColor = "text-purple-500 dark:text-purple-400";
      rarityBorderColor = "border-purple-500/30";
      glowEffect = "shadow-[0_0_30px_rgba(168,85,247,0.3)]";
      break;
  }

  // Handle stage count representation
  const activeStage = stages ? stages.findIndex((st) => rarity === st.rarity) + 1 : 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop blur */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm dark:bg-black/75 transition-opacity"
        onClick={onClose}
      />

      {/* Main card */}
      <div
        className={`relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-[#282828] dark:bg-[#1a1a1a] animate-in fade-in zoom-in-95 duration-200 ${glowEffect}`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700 dark:text-zinc-500 dark:hover:bg-[#232323] dark:hover:text-zinc-300 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Top: Large Badge Render */}
        <div className="flex flex-col items-center py-6">
          <div className="relative flex h-32 w-32 items-center justify-center">
            {/* Background glowing circle for high rarities */}
            {isEarned && (rarity === "EPIC" || rarity === "LEGENDARY" || rarity === "MYTHIC") && (
              <div
                className={`absolute inset-0 -z-10 rounded-full blur-xl opacity-35 animate-pulse`}
                style={{
                  background:
                    rarity === "EPIC"
                      ? "radial-gradient(circle, #f59e0b 0%, transparent 70%)"
                      : rarity === "LEGENDARY"
                      ? "radial-gradient(circle, #2d4 0%, transparent 70%)"
                      : "radial-gradient(circle, #c084fc 0%, transparent 70%)",
                }}
              />
            )}

            <BadgeArtwork
              rarity={rarity}
              shape={shape}
              status={status}
              progress={progress}
              icon={icon}
              size={112}
              glow={true}
              isCampus={isCampus}
            />
          </div>

          <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-[#ededed]">
            {title}
          </h3>
          <span className={`mt-1 text-[10px] font-extrabold uppercase tracking-widest ${rarityTextColor}`}>
            ✦ {rarity} {isCampus ? "CAMPUS INSIGNIA" : "ACHIEVEMENT"} ✦
          </span>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100 dark:bg-[#282828]" />

        {/* Content Body */}
        <div className="my-5 space-y-4 text-xs">
          {/* Requirement/Description */}
          <div>
            <span className="font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider text-[10px]">
              Requirement
            </span>
            <p className="mt-1 text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
              {description}
            </p>
          </div>

          {/* Progress Section */}
          {(isInProgress || (isEarned && typeof currentValue === "number")) && (
            <div>
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-semibold mb-1">
                <span>Progress</span>
                <span>
                  {typeof currentValue === "number" && typeof maxValue === "number"
                    ? `${currentValue} / ${maxValue}`
                    : `${progress}%`}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full bg-[#3ecf8e] shadow-[0_0_8px_#3ecf8e]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Stage Progression info if applicable */}
          {stages && (
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-[#282828] dark:bg-[#232323]/40">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-2">
                <RefreshCw className="h-3 w-3" />
                <span>Evolution Progression</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {stages.map((st, idx) => {
                  const isCurrent = st.rarity === rarity;
                  const isPassed = idx < activeStage;
                  return (
                    <div
                      key={idx}
                      className={`rounded-lg border p-1.5 text-center transition-all ${
                        isCurrent
                          ? "border-[#3ecf8e] bg-[#3ecf8e]/10 text-[#3ecf8e]"
                          : isPassed
                          ? "border-slate-200 bg-slate-50 text-slate-400 dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-600"
                          : "border-slate-100 bg-transparent text-slate-300 dark:border-zinc-800/30 dark:text-zinc-700"
                      }`}
                    >
                      <div className="text-[9px] font-bold uppercase tracking-wider">{st.rarity.slice(0, 4)}</div>
                      <div className="text-[10px] font-extrabold mt-0.5">{st.value}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Metadata Footer */}
          <div className="grid grid-cols-2 gap-4 pt-1 text-[11px]">
            <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400">
              <Award className="h-4 w-4 text-slate-400" />
              <div>
                <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Category</div>
                <div className="font-semibold text-slate-800 dark:text-zinc-200">{category}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400">
              <Calendar className="h-4 w-4 text-slate-400" />
              <div>
                <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Status</div>
                <div className="font-semibold text-slate-800 dark:text-zinc-200">
                  {isEarned ? (
                    <span className="text-[#3ecf8e]">
                      Unlocked {earnedDate ? new Date(earnedDate).toLocaleDateString(undefined, { month: "short", year: "numeric" }) : ""}
                    </span>
                  ) : isLocked ? (
                    <span className="text-slate-400 dark:text-zinc-500">Locked</span>
                  ) : (
                    <span className="text-amber-500">In Progress</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full rounded-xl bg-slate-900 py-3 text-xs font-bold text-white hover:bg-slate-800 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 transition-colors shadow-sm"
        >
          Close Insignia Details
        </button>
      </div>
    </div>
  );
}
