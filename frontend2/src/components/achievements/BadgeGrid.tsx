"use client";

import React, { useState, useMemo } from "react";
import { Badge as BadgeType } from "@/lib/skillsData";
import Badge from "./Badge";
import BadgeStats from "./BadgeStats";
import BadgeFilters from "./BadgeFilters";
import BadgeDetailModal from "./BadgeDetailModal";

interface BadgeGridProps {
  badges: BadgeType[];
}

export default function BadgeGrid({ badges }: BadgeGridProps) {
  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("earned");
  const [selectedRarity, setSelectedRarity] = useState<string>("all");
  
  // Selected badge for details modal
  const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null);

  // Compute unique categories dynamically from the data
  const categories = useMemo(() => {
    const cats = badges.map((b) => b.category).filter(Boolean);
    return Array.from(new Set(cats));
  }, [badges]);

  // Filter the badges
  const filteredBadges = useMemo(() => {
    return badges.filter((badge) => {
      // 1. Category check
      if (selectedCategory !== "all" && badge.category !== selectedCategory) {
        return false;
      }
      // 2. Status check
      if (selectedStatus !== "all") {
        if (selectedStatus === "earned" && badge.status !== "earned") return false;
        if (selectedStatus === "locked" && badge.status !== "locked") return false;
        if (selectedStatus === "in-progress") {
          if (badge.status !== "in-progress" && badge.status !== "in_progress") return false;
        }
      }
      // 3. Rarity check
      if (selectedRarity !== "all" && badge.rarity !== selectedRarity) {
        return false;
      }
      return true;
    });
  }, [badges, selectedCategory, selectedStatus, selectedRarity]);

  return (
    <div className="space-y-5">
      {/* Statistics Bar */}
      <BadgeStats badges={badges} />

      {/* Filter Toolbar */}
      <BadgeFilters
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedStatus={selectedStatus}
        onSelectStatus={setSelectedStatus}
        selectedRarity={selectedRarity}
        onSelectRarity={setSelectedRarity}
      />

      {/* Badge Grid Gallery */}
      {filteredBadges.length > 0 ? (
        <div className="grid grid-cols-2 gap-3.5 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 pt-2">
          {filteredBadges.map((badge) => (
            <Badge
              key={badge.id}
              badge={badge}
              onClick={(b) => setSelectedBadge(b)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50/50 dark:bg-[#1a1a1a]/30">
          <p className="text-sm font-semibold text-slate-400 dark:text-zinc-500">
            No matching badges found
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("all");
              setSelectedStatus("earned");
              setSelectedRarity("all");
            }}
            className="mt-2 text-xs font-bold text-[#3ecf8e] hover:underline"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Details Popup Modal */}
      {selectedBadge && (
        <BadgeDetailModal
          badge={selectedBadge}
          onClose={() => setSelectedBadge(null)}
        />
      )}
    </div>
  );
}
