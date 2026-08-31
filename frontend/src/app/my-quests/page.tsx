"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Check, ClipboardList, Eye, Loader2, Plus, Users, X, Trash2, Clock, CheckCircle2, XCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import CreateQuestModal from "@/components/CreateQuestModal";
import AuthModal from "@/components/AuthModal";
import PlayerProfileCard, { PlayerSkill } from "@/components/PlayerProfileCard";
import MetalPlayerCard from "@/components/MetalPlayerCard";
import BadgeGrid from "@/components/achievements/BadgeGrid";
import { mockAchievements, mockCampusBadges } from "@/lib/skillsData";
import { getHighestTier, getLevelFromSkills } from "@/lib/tierConfig";
import { api } from "@/lib/api";

type AppStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED";
type Application = { id: string; projectId: string; projectTitle: string; roleTitle: string; applicationStatus: AppStatus; appliedAt?: string; applicant?: { userId?: string; fullName?: string; major?: string; email?: string; collegeYear?: number; skills?: Array<{ skillName?: string; rankTier?: string; category?: string; id?: string }> } };
type Quest = { id: string; title: string; description?: string; status: "OPEN" | "IN_PROGRESS" | "COMPLETED"; createdAt?: string; owner?: { id?: string }; roles?: unknown[] };
const statusStyle: Record<AppStatus, string> = { PENDING: "bg-amber-400/15 text-amber-700 dark:text-amber-300", ACCEPTED: "bg-[#3ecf8e]/15 text-[#21875c] dark:text-[#3ecf8e]", REJECTED: "bg-rose-500/15 text-rose-700 dark:text-rose-300", COMPLETED: "bg-purple-500/15 text-purple-700 dark:text-purple-300" };
const statusIcon: Record<AppStatus, any> = { PENDING: Clock, ACCEPTED: CheckCircle2, REJECTED: XCircle, COMPLETED: CheckCircle2 };

export default function MyQuestsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, setTab] = useState<"posted" | "applied">("posted");
  const [posted, setPosted] = useState<Quest[]>([]);
  const [applied, setApplied] = useState<Application[]>([]);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [applicants, setApplicants] = useState<Application[]>([]);
  const [selectedApplicant, setSelectedApplicant] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalRedirectTo, setAuthModalRedirectTo] = useState<string | undefined>(undefined);
  const pathname = usePathname();
  const getCurrentUrl = () => {
    if (typeof window === "undefined") return pathname || "/my-quests";
    return window.location.pathname + window.location.search;
  };
  const handleOpenCreateQuest = () => {
    const hasToken = typeof window !== "undefined" && !!localStorage.getItem("sidequest_jwt_token");
    if (!hasToken) {
      setAuthModalRedirectTo(getCurrentUrl());
      setIsAuthModalOpen(true);
    } else {
      setIsCreateModalOpen(true);
    }
  };
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const profile = await api.profiles.getMe().catch(() => null);
      if (!profile) throw new Error("not authed");
      const myId = String((profile as any)?.userId ?? (profile as any)?.id ?? "");
      const myEmail = (profile as any)?.email?.toLowerCase?.();
      let projects: Quest[] = [];
      let applications: Application[] = [];
      try { projects = (await api.projects.list()) as Quest[]; } catch {}
      try { applications = (await api.applications.getMyApplications()) as Application[]; } catch {}
      setPosted((projects as Quest[]).filter((quest) => {
        const ownerId = String((quest as any).owner?.id ?? (quest as any).owner?.userId ?? (quest as any).ownerId ?? "");
        const ownerEmail = (quest as any).owner?.email?.toLowerCase?.();
        return (myId && ownerId && ownerId === myId) || (myEmail && ownerEmail && ownerEmail === myEmail);
      }));
      setApplied(applications as Application[]);
    } catch {
      setError("Quest management is unavailable until you sign in to the SideQuest backend.");
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  // Task 3: Direct navigation from feed's View Applications button
  useEffect(() => {
    if (loading || posted.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const viewId = params.get("viewApplicants");
    if (viewId) {
      const target = posted.find((q) => q.id === viewId);
      if (target) {
        setTab("posted");
        openApplicants(target);
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, [posted, loading]);

  // Task 3 & 4: Real-time status tracking — refetch on tab switch + polling when Applied visible
  useEffect(() => {
    if (tab !== "applied") return;
    // immediate refresh when switching to Applied
    api.applications.getMyApplications().then((apps) => setApplied(apps as Application[])).catch(()=>{});
    const interval = setInterval(async () => {
      try {
        const apps = await api.applications.getMyApplications() as Application[];
        setApplied(apps);
      } catch {}
    }, 10000);
    const onFocus = () => {
      api.applications.getMyApplications().then((apps) => setApplied(apps as Application[])).catch(()=>{});
    };
    window.addEventListener("focus", onFocus);
    return () => { clearInterval(interval); window.removeEventListener("focus", onFocus); };
  }, [tab]);

  const openApplicants = async (quest: Quest) => {
    setSelectedQuest(quest);
    setApplicants([]);
    try {
      const data = await api.projects.getApplications(quest.id) as Application[];
      setApplicants(data);
    } catch { setError("Unable to load applicants for this quest."); }
  };
  const closeApplicants = () => { setSelectedQuest(null); setSelectedApplicant(null); };
  const decide = async (application: Application, status: "ACCEPTED" | "REJECTED") => {
    try {
      await api.applications.updateStatus(application.id, status);
      setApplicants((current) => current.map((item) => item.id === application.id ? { ...item, applicationStatus: status } : item));
      // Broadcast status change — applicant's Applied tab will pick up via polling/focus refetch, but also update local applied if this user is also applicant (rare)
      if (status === "ACCEPTED" && selectedQuest) setPosted((current) => current.map((quest) => quest.id === selectedQuest.id ? { ...quest, status: "IN_PROGRESS" } : quest));
    } catch { setError("Unable to update this application. Please try again."); }
  };
  const withdraw = async (application: Application) => {
    try {
      try {
        await api.applications.withdraw(application.id);
        setApplied((current) => current.filter((item) => item.id !== application.id));
      } catch (err: any) {
        const msg = String(err?.message || "");
        if (msg.includes("404") || msg.includes("405")) throw err;
        await api.applications.updateStatus(application.id, "REJECTED");
        setApplied((current) => current.map((item) => item.id === application.id ? { ...item, applicationStatus: "REJECTED" } : item));
      }
    } catch { setError("Unable to withdraw this application."); }
  };
  const deleteQuest = async (quest: Quest) => {
    if (!confirm(`Delete quest "${quest.title}"? This cannot be undone.`)) return;
    try {
      await api.projects.delete(quest.id);
      setPosted((current) => current.filter((q) => q.id !== quest.id));
      if (selectedQuest?.id === quest.id) setSelectedQuest(null);
    } catch (err: any) { setError(err?.message || "Unable to delete quest."); }
  };
  const counts = useMemo(() => applicants.reduce((total, application) => total + (application.applicationStatus === "PENDING" ? 1 : 0), 0), [applicants]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-[#121212] dark:text-[#ededed]">
      <Navbar onToggleSidebar={() => setSidebarOpen((open) => !open)} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="min-h-[calc(100vh-3.5rem)] w-full lg:pl-64">
          <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-[#282828]">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3ecf8e]/10 text-[#21875c] dark:text-[#3ecf8e]"><ClipboardList className="h-4 w-4" /></div>
                <div><h1 className="text-xl font-bold">My Quests</h1><p className="text-xs text-slate-500 dark:text-zinc-400">Review applicant decisions and track your submitted applications.</p></div>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={handleOpenCreateQuest} className="inline-flex items-center gap-1.5 rounded-lg bg-[#3ecf8e] px-4 py-2 text-xs font-bold text-[#042f1a] shadow-sm hover:bg-[#34b27b]"><Plus className="h-3.5 w-3.5" />Post Quest</button>
                <div role="tablist" className="flex rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-[#383838] dark:bg-[#161616]">
                  <button type="button" onClick={() => setTab("posted")} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${tab === "posted" ? "bg-[#3ecf8e] text-[#042f1a] shadow-sm" : "text-slate-500 dark:text-zinc-400"}`}>Posted Quests</button>
                  <button type="button" onClick={() => setTab("applied")} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${tab === "applied" ? "bg-[#3ecf8e] text-[#042f1a] shadow-sm" : "text-slate-500 dark:text-zinc-400"}`}>Applied Quests</button>
                </div>
              </div>
            </header>
            {error && <p className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">{error}</p>}
            {loading ? <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-[#3ecf8e]" /></div> : tab === "posted" ? (
              <div className="space-y-3">{posted.length ? posted.map((quest) => (
                <article key={quest.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#282828] dark:bg-[#1c1c1c]">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0"><h2 className="break-words text-sm font-semibold">{quest.title}</h2><p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">Created {quest.createdAt ? new Date(quest.createdAt).toLocaleDateString() : "recently"} · {quest.roles?.length || 0} roles</p></div>
                    <span className="rounded-full bg-sky-500/10 px-2.5 py-1 text-[10px] font-bold text-sky-700 dark:text-sky-300">{quest.status.replace("_", " ")}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" onClick={() => openApplicants(quest)} className="inline-flex items-center gap-1.5 rounded-lg bg-[#3ecf8e] px-3 py-2 text-xs font-semibold text-[#042f1a]"><Users className="h-3.5 w-3.5" />View Applicants</button>
                    <button type="button" onClick={() => deleteQuest(quest)} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-900/40 dark:bg-[#1c1c1c] dark:text-rose-400"><Trash2 className="h-3.5 w-3.5" />Delete Quest</button>
                  </div>
                </article>
              )) : <Empty text="You have not posted any quests yet." />}</div>
            ) : (
              <div className="space-y-3">{applied.length ? applied.map((application) => {
                const Icon = statusIcon[application.applicationStatus] || Clock;
                return (
                <article key={application.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#282828] dark:bg-[#1c1c1c]">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div><h2 className="text-sm font-semibold">{application.projectTitle}</h2><p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">Applied for {application.roleTitle} · {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : "recently"}</p></div>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${statusStyle[application.applicationStatus]}`}>
                      <Icon className="h-3 w-3" />{application.applicationStatus}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[11px]">
                    {application.applicationStatus === "PENDING" && <span className="text-amber-600 dark:text-amber-300">Waiting for owner decision</span>}
                    {application.applicationStatus === "ACCEPTED" && <span className="text-[#21875c] dark:text-[#3ecf8e] font-medium">Accepted — check team chat for next steps</span>}
                    {application.applicationStatus === "REJECTED" && <span className="text-rose-600 dark:text-rose-300">Rejected — keep exploring other quests</span>}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href={`/quests`} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold dark:border-[#383838]"><Eye className="h-3.5 w-3.5" />View quest</Link>
                    {application.applicationStatus === "PENDING" && <button type="button" onClick={() => withdraw(application)} className="rounded-lg border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-600 dark:border-rose-900 dark:text-rose-300">Withdraw application</button>}
                  </div>
                </article>
              )}) : <Empty text="You have not applied to any quests yet." />}</div>
            )}
            {selectedQuest && <ApplicantModal quest={selectedQuest} applicants={applicants} pending={counts} onClose={closeApplicants} onDecide={decide} onViewProfile={(app) => setSelectedApplicant(app)} />}
            {selectedApplicant && <ApplicantProfileModal application={selectedApplicant} onClose={() => setSelectedApplicant(null)} />}
          </div>
        </main>
      </div>
      <CreateQuestModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onQuestCreated={load} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} redirectTo={authModalRedirectTo} />
    </div>
  );
}

function Empty({ text }: { text: string }) { return <div className="rounded-xl border border-dashed border-slate-200 bg-white px-5 py-16 text-center text-sm text-slate-500 dark:border-[#383838] dark:bg-[#1c1c1c] dark:text-zinc-400">{text}</div>; }
function ApplicantModal({ quest, applicants, pending, onClose, onDecide, onViewProfile }: { quest: Quest; applicants: Application[]; pending: number; onClose: () => void; onDecide: (application: Application, status: "ACCEPTED" | "REJECTED") => void; onViewProfile: (application: Application) => void }) {
  return <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={onClose}><aside onClick={(event) => event.stopPropagation()} className="h-full w-full max-w-xl overflow-y-auto bg-white p-5 shadow-2xl dark:bg-[#1c1c1c] sm:p-6"><div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-4 dark:border-[#282828]"><div><h2 className="text-base font-semibold">Applicants</h2><p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">{quest.title} · {pending} pending</p></div><button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-[#282828]"><X className="h-5 w-5" /></button></div><div className="mt-4 space-y-3">{applicants.length ? applicants.map((application) => <article key={application.id} className="rounded-xl border border-slate-200 p-4 dark:border-[#383838]"><div className="flex gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3ecf8e]/15 text-xs font-bold text-[#21875c] dark:text-[#3ecf8e]">{(application.applicant?.fullName || "A").slice(0, 1)}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-semibold">{application.applicant?.fullName || application.applicant?.email || "Applicant"}</h3><span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${statusStyle[application.applicationStatus]}`}>{application.applicationStatus}</span></div><p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">{application.applicant?.major || "Campus builder"}</p><div className="mt-2 flex flex-wrap gap-1">{application.applicant?.skills?.slice(0, 4).map((skill, index) => <span key={`${skill.skillName}-${index}`} className="rounded bg-slate-100 px-2 py-0.5 text-[10px] dark:bg-[#282828]">{skill.skillName}</span>)}</div><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => onViewProfile(application)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[10px] font-semibold dark:border-[#383838] hover:bg-slate-50 dark:hover:bg-[#282828]">Applicant Profile</button>{application.applicationStatus === "PENDING" && <><button type="button" onClick={() => onDecide(application, "ACCEPTED")} className="inline-flex items-center gap-1 rounded-lg bg-[#3ecf8e] px-2.5 py-1.5 text-[10px] font-semibold text-[#042f1a]"><Check className="h-3 w-3" />Accept</button><button type="button" onClick={() => onDecide(application, "REJECTED")} className="rounded-lg border border-rose-300 px-2.5 py-1.5 text-[10px] font-semibold text-rose-600 dark:border-rose-900 dark:text-rose-300">Reject</button></>}</div></div></div></article>) : <Empty text="No applications have been submitted yet." />}</div></aside></div>;
}

function ApplicantProfileModal({ application, onClose }: { application: Application; onClose: () => void }) {
  const [freshProfile, setFreshProfile] = useState<any>(null);
  const baseSkills: PlayerSkill[] = (application.applicant?.skills || []).map((s, idx) => ({
    id: (s as any).id || String(idx),
    skillName: s.skillName || "Skill",
    category: (s as any).category || "General",
    rankTier: (s.rankTier as any) || "BRONZE",
    verified: false,
  }));
  useEffect(() => {
    const uid = (application.applicant as any)?.userId;
    if (!uid) return;
    api.profiles.getById(uid).then(setFreshProfile).catch(()=>{});
  }, [(application.applicant as any)?.userId]);
  const skills: PlayerSkill[] = freshProfile?.skills ? freshProfile.skills.map((s: any) => ({
    id: s.id || s.skillId,
    skillName: s.skillName,
    category: s.category,
    rankTier: s.rankTier || "BRONZE",
    verified: s.verificationStatus === "VERIFIED",
  })) : baseSkills;
  const level = getLevelFromSkills(skills.length);
  const highest = getHighestTier(skills.map(s => s.rankTier as any));
  const fullName = freshProfile?.fullName || application.applicant?.fullName || application.applicant?.email || "Applicant";
  const major = freshProfile?.major || application.applicant?.major || "Campus Builder";
  const gradYear = freshProfile?.collegeYear ? 2024 + freshProfile.collegeYear : (application.applicant?.collegeYear ? 2024 + application.applicant.collegeYear : 2027);
  const activeStatus = freshProfile?.activeStatus === "IN_A_PARTY" ? "IN_A_PARTY" : freshProfile?.activeStatus === "INACTIVE" ? "OFFLINE" : "OPEN_TO_JOIN";
  const rankTier = (freshProfile?.rankTier as any) || highest;
  const isNew = skills.length === 0;
  const achievements = isNew ? mockAchievements.map(b => ({ ...b, status: "locked" as const, progress: 0, currentValue: 0 })) : mockAchievements;
  const badges = isNew ? mockCampusBadges.map(b => ({ ...b, status: "locked" as const, progress: 0, currentValue: 0 })) : mockCampusBadges;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[#f8fafc] dark:bg-[#121212] p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-[#ededed]">Applicant Full Profile</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-[#282828]"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-6">
          <div className="flex justify-center">
            <MetalPlayerCard config={{ tier: rankTier, backgroundType: "default", pattern: "circuit", showAvatar: true, showUsername: true, showLevel: true, showTier: true, showMainSkill: true, showQuestCount: true, showAchievementCount: true, showCampusBadgeCount: true, showGithub: true, customTitle: major }} userData={{ fullName, level, skillsCount: skills.length, questsCount: isNew ? 0 : 5, achievementsCount: achievements.filter(b=>b.status==="earned").length, badgesCount: badges.filter(b=>b.status==="earned").length, mainSkill: skills[0]?.skillName }} />
          </div>
          <PlayerProfileCard fullName={fullName} major={major} gradYear={gradYear} activeStatus={activeStatus as any} skills={skills} bio={`Applied for ${application.roleTitle} on ${application.projectTitle} — ${skills.length} skills unlocked`} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-[#282828] dark:bg-[#1c1c1c]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-3">Achievements</h4>
              <BadgeGrid badges={achievements.slice(0,4)} unfilteredBadges={achievements} />
            </section>
            <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-[#282828] dark:bg-[#1c1c1c]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-3">Campus Badges</h4>
              <BadgeGrid badges={badges.slice(0,4)} unfilteredBadges={badges} />
            </section>
          </div>
          <button type="button" onClick={onClose} className="w-full rounded-lg bg-[#3ecf8e] py-2.5 text-xs font-bold text-[#042f1a] hover:bg-[#34b27b]">Close</button>
        </div>
      </div>
    </div>
  );
}
