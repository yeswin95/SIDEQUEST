"use client";

const STORAGE_KEY = "sidequest_saved_quests";
export const SAVED_QUESTS_CHANGED = "sidequest_saved_quests_changed";

export interface SavedQuest {
  id: string; title: string; description: string; ownerName: string; ownerRole?: string;
  guildTag?: string; datePosted: string; requiredSkills: string[];
  roles: Array<{ id: string; roleTitle: string; filled: number; total: number }>;
  repoLink?: string; upvotes?: number; commentsCount?: number;
}

export function getSavedQuests(): SavedQuest[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value.filter((quest): quest is SavedQuest => Boolean(quest?.id && quest?.title)) : [];
  } catch { return []; }
}

export function getSavedQuestIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return getSavedQuests().map((quest) => quest.id);
  } catch {
    return [];
  }
}

export function setQuestSaved(quest: SavedQuest, saved: boolean) {
  const quests = getSavedQuests().filter((item) => item.id !== quest.id);
  if (saved) quests.unshift(quest);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(quests));
  window.dispatchEvent(new CustomEvent(SAVED_QUESTS_CHANGED));
}
