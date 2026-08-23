"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import QuestCard from "@/components/QuestCard";
import { getSavedQuests, SAVED_QUESTS_CHANGED, SavedQuest } from "@/lib/savedQuests";

export default function SavedQuestsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quests, setQuests] = useState<SavedQuest[]>([]);
  useEffect(() => {
    const sync = () => setQuests(getSavedQuests());
    sync(); window.addEventListener(SAVED_QUESTS_CHANGED, sync);
    return () => window.removeEventListener(SAVED_QUESTS_CHANGED, sync);
  }, []);
  return <div className="min-h-screen bg-[#f8fafc] dark:bg-[#121212]">
    <Navbar onToggleSidebar={() => setSidebarOpen((open) => !open)} />
    <div className="flex"><Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="min-h-[calc(100vh-3.5rem)] w-full lg:pl-64"><div className="mx-auto max-w-4xl space-y-5 px-4 py-6 sm:px-6">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-[#282828]">
          <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500"><Bookmark className="h-4 w-4" /></div><div><h1 className="text-xl font-bold text-slate-900 dark:text-[#ededed]">Saved Quests</h1><p className="text-xs text-slate-500 dark:text-zinc-400">Your shortlist of teams and projects.</p></div></div>
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#21875c] hover:underline dark:text-[#3ecf8e]"><ArrowLeft className="h-3.5 w-3.5" />Back to quests</Link>
        </header>
        {quests.length ? <div className="space-y-4">{quests.map((quest) => <QuestCard key={quest.id} {...quest} isSaved onSavedChange={() => setQuests(getSavedQuests())} />)}</div> :
          <div className="rounded-xl border border-dashed border-slate-200 bg-white px-5 py-16 text-center dark:border-[#383838] dark:bg-[#1c1c1c]"><Bookmark className="mx-auto h-8 w-8 text-slate-300 dark:text-zinc-600" /><h2 className="mt-3 text-sm font-semibold text-slate-700 dark:text-zinc-200">No saved quests yet</h2><p className="mx-auto mt-1 max-w-sm text-xs text-slate-500 dark:text-zinc-400">Bookmark a quest from the board to build a focused shortlist.</p><Link href="/" className="mt-4 inline-block rounded-lg bg-[#3ecf8e] px-4 py-2 text-xs font-semibold text-[#042f1a]">Explore quests</Link></div>}
      </div></main></div>
  </div>;
}
