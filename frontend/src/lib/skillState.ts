export interface UserGoal { id: string; title: string; skillId?: string; completed: boolean; }
const COMPLETED_KEY = "sidequest_completed_skill_ids";
const GOALS_KEY = "sidequest_next_goals";
function safeGetItem(key: string): string | null {
  try { if (typeof window === "undefined" || !window.localStorage) return null; return window.localStorage.getItem(key); } catch { return null; }
}
function safeSetItem(key: string, value: string): void {
  try { if (typeof window === "undefined" || !window.localStorage) return; window.localStorage.setItem(key, value); } catch {}
}
export function loadCompletedSkillIds(defaultIds: string[]) { try { const raw = safeGetItem(COMPLETED_KEY); if (raw === null) return defaultIds; const value = JSON.parse(raw || "null"); return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : defaultIds; } catch { return defaultIds; } }
export function saveCompletedSkillIds(ids: string[]) { safeSetItem(COMPLETED_KEY, JSON.stringify(ids)); }
export function loadGoals(): UserGoal[] { try { const raw = safeGetItem(GOALS_KEY); if (raw === null) return []; const value = JSON.parse(raw || "[]"); return Array.isArray(value) ? value.filter((goal): goal is UserGoal => Boolean(goal?.id && goal?.title)) : []; } catch { return []; } }
export function saveGoals(goals: UserGoal[]) { safeSetItem(GOALS_KEY, JSON.stringify(goals)); }
