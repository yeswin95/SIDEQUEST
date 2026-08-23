"use client";

export interface UserGoal { id: string; title: string; skillId?: string; completed: boolean; }
const COMPLETED_KEY = "sidequest_completed_skill_ids";
const GOALS_KEY = "sidequest_next_goals";
export function loadCompletedSkillIds(defaultIds: string[]) { try { const value = JSON.parse(localStorage.getItem(COMPLETED_KEY) || "null"); return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : defaultIds; } catch { return defaultIds; } }
export function saveCompletedSkillIds(ids: string[]) { localStorage.setItem(COMPLETED_KEY, JSON.stringify(ids)); }
export function loadGoals(): UserGoal[] { try { const value = JSON.parse(localStorage.getItem(GOALS_KEY) || "[]"); return Array.isArray(value) ? value.filter((goal): goal is UserGoal => Boolean(goal?.id && goal?.title)) : []; } catch { return []; } }
export function saveGoals(goals: UserGoal[]) { localStorage.setItem(GOALS_KEY, JSON.stringify(goals)); }
