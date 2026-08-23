"use client";

import React, { useState, useRef } from "react";
import { Badge as BadgeType } from "@/lib/skillsData";
import BadgeArtwork from "./BadgeArtwork";

interface BadgeProps {
  badge: BadgeType;
  onClick: (badge: BadgeType) => void;
}

export default function Badge({ badge, onClick }: BadgeProps) {
  const { title, rarity, shape, status, progress, icon, isCampus } = badge;
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 50, y: 50 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCoords({ x, y });
  };

  const handleMouseEnter = () => setHovered(true);
  const handleMouseLeave = () => {
    setHovered(false);
    setCoords({ x: 50, y: 50 });
  };

  // Calculate 3D rotation angles based on cursor offset
  const rotateX = hovered ? -(coords.y - 50) / 4.5 : 0; // limit to ~11 deg
  const rotateY = hovered ? (coords.x - 50) / 4.5 : 0;
  const shadowOffset = hovered ? 16 : 8;

  // Determine rarity tag colors
  let rarityTagColor = "text-slate-400 dark:text-zinc-500 bg-slate-100 dark:bg-zinc-800/60";
  switch (rarity) {
    case "COMMON":
      rarityTagColor = "text-slate-400 dark:text-zinc-500 bg-slate-100 dark:bg-zinc-800/40 border border-slate-200/30";
      break;
    case "UNCOMMON":
      rarityTagColor = "text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 border border-slate-300/30";
      break;
    case "RARE":
      rarityTagColor = "text-sky-500 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/30 border border-sky-400/20";
      break;
    case "EPIC":
      rarityTagColor = "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-500/20";
      break;
    case "LEGENDARY":
      rarityTagColor = "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30 border border-teal-500/20";
      break;
    case "MYTHIC":
      rarityTagColor = "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 border border-purple-500/20 animate-pulse";
      break;
  }

  const isLocked = status === "locked";

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onClick(badge)}
      className="group relative flex min-h-[154px] flex-col items-center justify-between cursor-pointer rounded-xl p-3.5 select-none transition-all duration-300 active:scale-95"
      style={{
        perspective: "1000px",
      }}
    >
      {/* 3D Physical Card Wrapper */}
      <div
        className="relative flex flex-col items-center transition-all duration-200 ease-out"
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${hovered ? "8px" : "0px"})`,
          filter: `drop-shadow(0 ${shadowOffset}px ${shadowOffset * 1.5}px rgba(0, 0, 0, ${hovered ? 0.35 : 0.18}))`,
        }}
      >
        {/* Shiny Highlight Reflection overlay */}
        {hovered && !isLocked && (
          <div
            className="absolute inset-0 pointer-events-none z-20 transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at ${coords.x}% ${coords.y}%, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0) 55%)`,
              mixBlendMode: "overlay",
            }}
          />
        )}

        {/* The Badge Artwork */}
        <BadgeArtwork
          rarity={rarity}
          shape={shape}
          status={status}
          progress={progress}
          icon={icon}
          size={84}
          glow={hovered}
          isCampus={isCampus}
        />
      </div>

      {/* Rarity and Title Labels underneath */}
      <div className="mt-3.5 flex w-full flex-col items-center text-center">
        <span className="break-words text-[10px] font-bold leading-snug tracking-tight text-slate-800 dark:text-zinc-200 group-hover:text-[#3ecf8e] dark:group-hover:text-[#3ecf8e] transition-colors">
          {title}
        </span>
        <span className={`mt-1 rounded px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-widest ${rarityTagColor}`}>
          {rarity}
        </span>
      </div>

      {/* Progress display (small indicator bubble) if in progress */}
      {!isLocked && status !== "earned" && progress > 0 && (
        <span className="absolute right-2 top-2 rounded-full bg-slate-100 dark:bg-[#232323] px-1.5 py-0.5 text-[8px] font-bold text-slate-500 dark:text-zinc-400 border border-slate-200/20">
          {progress}%
        </span>
      )}
    </div>
  );
}
