"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import SkillNodeTree, { SkillTreeNode } from "@/components/SkillNodeTree";
import SkillDetailsModal from "@/components/SkillDetailsModal";
import NextGoals from "@/components/NextGoals";
import SkillsToUnlock from "@/components/SkillsToUnlock";
import CreateQuestModal from "@/components/CreateQuestModal";
import { mockSkills, Skill } from "@/lib/skillsData";
import { loadCompletedSkillIds, loadGoals, saveCompletedSkillIds, saveGoals, UserGoal } from "@/lib/skillState";
import { Layers, List, Network } from "lucide-react";

export default function SkillsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [skillQuery, setSkillQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [activeView, setActiveView] = useState<"list" | "tree">("list");
  const [completedSkillIds, setCompletedSkillIds] = useState<string[]>([]);
  const [goals, setGoals] = useState<UserGoal[]>([]);
  const categories = useMemo(() => Array.from(new Set(mockSkills.map((skill) => skill.category))).sort(), []);
  useEffect(() => { setCompletedSkillIds(loadCompletedSkillIds(mockSkills.filter((skill) => skill.status === "mastered").map((skill) => skill.id))); setGoals(loadGoals()); }, []);
  const completed = new Set(completedSkillIds);
  const isUnlocked = (skill: Skill) => skill.prerequisites.every((id) => completed.has(id));
  const resolvedSkills = mockSkills.map((skill) => ({ ...skill, status: completed.has(skill.id) ? "mastered" as const : "locked" as const, progress: completed.has(skill.id) ? 100 : 0 }));
  const treeNodes: SkillTreeNode[] = resolvedSkills.map((s) => ({
    id: s.id,
    skillName: s.name,
    parentId: s.parentId,
    rankTier: s.rankTier,
    category: s.category,
    completed: completed.has(s.id),
    locked: !completed.has(s.id) && !isUnlocked(s),
  }));

  const selectedSkill = resolvedSkills.find((s) => s.id === selectedSkillId) || null;
  const skillsByCategory = useMemo(() => {
    return resolvedSkills.filter((skill) => (selectedCategories.length === 0 || selectedCategories.includes(skill.category)) && (skill.name.toLowerCase().includes(skillQuery.toLowerCase().trim()) || skill.category.toLowerCase().includes(skillQuery.toLowerCase().trim()))).reduce<Record<string, typeof mockSkills>>((groups, skill) => {
      (groups[skill.category] ||= []).push(skill);
      return groups;
    }, {});
  }, [skillQuery, selectedCategories, completedSkillIds]);
  const displayedSkills = Object.values(skillsByCategory).flat();
  const toggleCategory = (category: string) => setSelectedCategories((current) => current.includes(category) ? current.filter((item) => item !== category) : [...current, category]);

  useEffect(() => {
    const storedView = window.localStorage.getItem("sidequest_skills_view");
    if (storedView === "tree" || storedView === "list") setActiveView(storedView);
  }, []);

  const selectView = (view: "list" | "tree") => {
    setActiveView(view);
    window.localStorage.setItem("sidequest_skills_view", view);
  };
  const toggleDone = (skill: Skill) => {
    if (!completed.has(skill.id) && !isUnlocked(skill)) return;
    const next = completed.has(skill.id) ? completedSkillIds.filter((id) => id !== skill.id) : [...completedSkillIds, skill.id];
    setCompletedSkillIds(next); saveCompletedSkillIds(next);
  };
  const addSkillGoal = (skill: Skill) => { if (goals.some((goal) => goal.skillId === skill.id)) return; const next = [...goals, { id: `skill-${skill.id}`, skillId: skill.id, title: skill.name, completed: completed.has(skill.id) }]; setGoals(next); saveGoals(next); };
  const updateGoals = (next: UserGoal[]) => { setGoals(next); saveGoals(next); };
  const toggleGoal = (id: string) => { const goal = goals.find((item) => item.id === id); if (!goal) return; if (goal.skillId) { const skill = mockSkills.find((item) => item.id === goal.skillId); if (skill) toggleDone(skill); return; } updateGoals(goals.map((item) => item.id === id ? { ...item, completed: !item.completed } : item)); };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-[#121212] dark:text-[#ededed] flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} onOpenCreateQuest={() => setIsCreateModalOpen(true)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onOpenCreateQuest={() => setIsCreateModalOpen(true)} />

        <div className="flex-1 lg:pl-64 flex justify-center">
          <main className="w-full max-w-6xl px-4 sm:px-6 py-6 space-y-6">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-[#282828]">
              <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3ecf8e]/10 text-[#3ecf8e]">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-[#ededed]">Skills</h1>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Track your learning paths, unlock new skills, and grow your matrix
                </p>
              </div>
              </div>
              <div role="tablist" aria-label="Skills view" className="flex rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-[#383838] dark:bg-[#161616]">
                <button role="tab" aria-selected={activeView === "list"} type="button" onClick={() => selectView("list")} className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${activeView === "list" ? "bg-[#3ecf8e] text-[#042f1a] shadow-sm" : "text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100"}`}><List className="h-3.5 w-3.5" />List View</button>
                <button role="tab" aria-selected={activeView === "tree"} type="button" onClick={() => selectView("tree")} className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${activeView === "tree" ? "bg-[#3ecf8e] text-[#042f1a] shadow-sm" : "text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100"}`}><Network className="h-3.5 w-3.5" />Skill Tree</button>
              </div>
            </header>

            {activeView === "list" ? <div key="list" className="animate-[skills-view-fade_180ms_ease-out] space-y-6"><section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-[#282828] dark:bg-[#1c1c1c]">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-[#ededed]">All skills</h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Browse every node in your skill matrix, organized by discipline.</p>
                </div>
                <span className="rounded-full bg-[#3ecf8e]/10 px-2.5 py-1 text-xs font-semibold text-[#21875c] dark:text-[#3ecf8e]">{mockSkills.length} skills</span>
              </div>
              <div className="mb-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => setSelectedCategories([])} className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${selectedCategories.length === 0 ? "bg-[#3ecf8e] text-[#042f1a]" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-[#232323] dark:text-zinc-300"}`}>All</button>
                {categories.map((category) => <button key={category} type="button" onClick={() => toggleCategory(category)} className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${selectedCategories.includes(category) ? "border-[#3ecf8e] bg-[#3ecf8e]/10 text-[#21875c] dark:text-[#3ecf8e]" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-[#383838] dark:bg-[#161616] dark:text-zinc-300"}`}>{category}</button>)}
              </div>
              <input value={skillQuery} onChange={(event) => setSkillQuery(event.target.value)} placeholder="Search skills or categories…" className="mb-4 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-[#3ecf8e] dark:border-[#383838] dark:bg-[#161616]" />
              <div className="grid gap-4 md:grid-cols-3">
                {Object.entries(skillsByCategory).map(([category, skills]) => (
                  <div key={category} className="min-w-0 rounded-lg border border-slate-100 bg-slate-50/70 p-3 dark:border-[#282828] dark:bg-[#161616]">
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-zinc-300">{category}</h3>
                    <div className="space-y-2">
                      {skills.map((skill) => (
                        <div key={skill.id} className="rounded px-1 py-1 hover:bg-white dark:hover:bg-[#202020]">
                        <button type="button" onClick={() => setSelectedSkillId(skill.id)} className="flex w-full min-w-0 items-start gap-2 text-left">
                          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${completed.has(skill.id) ? "bg-[#3ecf8e] shadow-[0_0_9px_rgba(62,207,142,0.7)]" : !isUnlocked(skill) ? "bg-slate-300 dark:bg-zinc-600" : "bg-amber-400"}`} />
                          <span className="min-w-0 flex-1 break-words text-xs font-medium text-slate-700 hover:text-[#21875c] dark:text-zinc-300 dark:hover:text-[#3ecf8e]">{skill.name}</span>
                          <span className={`shrink-0 text-[10px] ${completed.has(skill.id) ? "text-[#21875c] dark:text-[#3ecf8e]" : "text-slate-400 dark:text-zinc-500"}`}>{completed.has(skill.id) ? "Completed" : "Incomplete"}</span>
                        </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {Object.keys(skillsByCategory).length === 0 && <p className="py-5 text-center text-xs text-slate-500 dark:text-zinc-400">No skills match that search.</p>}
            </section>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <NextGoals goals={goals.map((goal) => goal.skillId && completed.has(goal.skillId) ? { ...goal, completed: true } : goal)} onAddCustom={(title) => updateGoals([...goals, { id: `custom-${Date.now()}`, title, completed: false }])} onToggle={toggleGoal} onRemove={(id) => updateGoals(goals.filter((goal) => goal.id !== id))} />
              <SkillsToUnlock skills={displayedSkills} onSelect={setSelectedSkillId} />
            </div>
            </div> : <div key="tree" className="animate-[skills-view-fade_180ms_ease-out]"><SkillNodeTree nodes={treeNodes} onNodeClick={setSelectedSkillId} selectedId={selectedSkillId ?? undefined} /></div>}
          </main>
        </div>
      </div>

      <SkillDetailsModal skill={selectedSkill} allSkills={resolvedSkills} completed={selectedSkill ? completed.has(selectedSkill.id) : false} locked={selectedSkill ? !completed.has(selectedSkill.id) && !isUnlocked(selectedSkill) : false} inGoals={selectedSkill ? goals.some((goal) => goal.skillId === selectedSkill.id) : false} onToggleCompleted={() => { if (selectedSkill) toggleDone(selectedSkill); }} onAddGoal={() => { if (selectedSkill) addSkillGoal(selectedSkill); }} onClose={() => setSelectedSkillId(null)} />

      <CreateQuestModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onQuestCreated={() => {}} />
    </div>
  );
}
