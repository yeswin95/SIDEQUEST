"use client";

import React from "react";
import { RarityType } from "@/lib/skillsData";

interface BadgeFiltersProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;

  selectedStatus: string;
  onSelectStatus: (status: string) => void;

  selectedRarity: string;
  onSelectRarity: (rarity: string) => void;
}

export default function BadgeFilters({
  categories,
  selectedCategory,
  onSelectCategory,
  selectedStatus,
  onSelectStatus,
  selectedRarity,
  onSelectRarity,
}: BadgeFiltersProps) {
  const statusOptions = [
    { value: "earned", label: "Earned" },
    { value: "in-progress", label: "In Progress" },
    { value: "locked", label: "Locked" },
    { value: "all", label: "All Status" },
  ];

  const rarityOptions: { value: string; label: string }[] = [
    { value: "all", label: "All Rarities" },
    { value: "COMMON", label: "Common" },
    { value: "UNCOMMON", label: "Uncommon" },
    { value: "RARE", label: "Rare" },
    { value: "EPIC", label: "Epic" },
    { value: "LEGENDARY", label: "Legendary" },
    { value: "MYTHIC", label: "Mythic" },
  ];

  return (
    <div className="flex flex-col gap-3 py-1">
      {/* Primary Category Filters - Horizontal Scrollable Badges */}
      <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => onSelectCategory("all")}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
            selectedCategory === "all"
              ? "bg-[#3ecf8e] text-white"
              : "bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-[#161616] dark:text-zinc-400 dark:hover:bg-[#202020]"
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onSelectCategory(cat)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              selectedCategory === cat
                ? "bg-[#3ecf8e] text-white"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-[#161616] dark:text-zinc-400 dark:hover:bg-[#202020]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Secondary Dropdown / Button Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status Toggle buttons */}
        <div className="flex max-w-full flex-wrap rounded-lg border border-slate-200 p-0.5 dark:border-[#282828] bg-slate-50 dark:bg-[#161616]">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelectStatus(opt.value)}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                selectedStatus === opt.value
                  ? "bg-white text-slate-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-200"
                  : "text-slate-500 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Rarity selector pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mr-1.5">
            Rarity:
          </span>
          {rarityOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelectRarity(opt.value)}
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-all border ${
                selectedRarity === opt.value
                  ? "border-[#3ecf8e] bg-[#3ecf8e]/10 text-[#3ecf8e] font-extrabold"
                  : "border-slate-200 dark:border-[#282828] text-slate-500 hover:border-slate-300 dark:text-zinc-500 dark:hover:border-zinc-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
