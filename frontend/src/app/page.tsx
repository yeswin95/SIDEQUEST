"use client";

import { useEffect, useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import QuestCard, { PartyRole } from "@/components/QuestCard";
import CreateQuestModal from "@/components/CreateQuestModal";
import ApplyModal, { QuestForApply } from "@/components/ApplyModal";
import AuthModal from "@/components/AuthModal";
import { api } from "@/lib/api";
import Link from "next/link";
import PublicProfileModal from "@/components/PublicProfileModal";
import {
  Search,
  Plus,
  RefreshCw,
  XCircle,
  Tag,
  CheckCircle2,
  ShieldAlert,
  Flame,
  Clock,
  Sparkles,
  Trophy,
  Users,
  ArrowRight,
  TrendingUp,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";

interface QuestPost {
  id: string;
  title: string;
  description: string;
  ownerName: string;
  ownerId?: string | null;
  ownerEmail?: string | null;
  ownerAvatarUrl?: string;
  ownerRole?: string;
  guildTag?: string;
  datePosted: string;
  requiredSkills: string[];
  roles: PartyRole[];
  repoLink?: string;
  upvotes?: number;
  downvotes?: number;
  userVote?: "UP" | "DOWN" | null;
  commentsCount?: number;
}

// Dummy feed removed — fresh DB shows empty until real quests are posted.
// Previously contained 4 mock posts (Campus Ride-Share, AI Summarizer, etc.).
// Kept as empty array to avoid dummy leaks; HomePage now renders "No Quests in Feed".
const mockFeedPosts: QuestPost[] = [];

type SortOption = "best" | "latest" | "top" | "open";

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [posts, setPosts] = useState<QuestPost[]>(() => {
    // Hydrate from session cache for instant render
    try {
      const cached = typeof window !== 'undefined' ? sessionStorage.getItem('sidequest_feed_cache') : null;
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("All Feed");
  const [sortBy, setSortBy] = useState<SortOption>("best");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [applyQuest, setApplyQuest] = useState<QuestForApply | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalRedirectTo, setAuthModalRedirectTo] = useState<string | undefined>(undefined);
  const [selectedAuthorId, setSelectedAuthorId] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const getCurrentUrl = () => {
    if (typeof window === "undefined") return pathname || "/";
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

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await api.projects.list();
      // Keep own quests in feed (task 3) — just capture current user for View Applications button
      let uid: string | null = null;
      let email: string | null = null;
      try {
        const me = await api.profiles.getMe();
        uid = String(me?.userId ?? me?.id ?? "");
        email = me?.email?.toLowerCase?.() ?? null;
        setCurrentUserId(uid || null);
        setCurrentUserEmail(email);
      } catch {
        setCurrentUserId(null);
        setCurrentUserEmail(null);
      }

      if (Array.isArray(data) && data.length > 0) {
        const mapped: QuestPost[] = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          ownerName: item.owner?.fullName || item.owner?.email || "Campus Leader",
          ownerRole: "Party Leader",
          guildTag: "CampusBuilds",
          datePosted: item.createdAt || new Date().toISOString(),
          repoLink: item.repoLink,
          ownerId: item.owner?.id ?? item.owner?.userId ?? null,
          ownerEmail: item.owner?.email?.toLowerCase?.() ?? null,
          ownerAvatarUrl: item.owner?.avatarUrl || null,
          requiredSkills: (item.roles || []).flatMap((r: any) =>
            (r.requiredSkills || []).map((s: any) => s.skillName)
          ).filter((val: string, idx: number, self: string[]) => self.indexOf(val) === idx),
          roles: (item.roles || []).map((r: any) => ({
            id: r.id,
            roleTitle: r.roleTitle,
            filled: r.filledSpots || 0,
            total: r.spotCount || 1,
          })),
          // Task 4 & 5: use real backend vote data or 0
          upvotes: typeof item.upvotes === "number" ? item.upvotes : 0,
          downvotes: typeof item.downvotes === "number" ? item.downvotes : 0,
          userVote: item.userVote === "UP" ? "UP" : item.userVote === "DOWN" ? "DOWN" : null,
          commentsCount: typeof item.commentsCount === "number" ? item.commentsCount : typeof item.comments === "number" ? item.comments : 0,
        } as QuestPost & { ownerEmail?: string | null }));
        setPosts(mapped as QuestPost[]);
        try { sessionStorage.setItem('sidequest_feed_cache', JSON.stringify(mapped)); } catch {}
      } else {
        // Fresh DB: no fallback to dummy — show empty feed
        setPosts([]);
      }
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    const handleAuth = () => fetchPosts();
    const handleBackendReady = () => fetchPosts();
    window.addEventListener('sidequest_auth_changed', handleAuth);
    window.addEventListener('storage', handleAuth);
    window.addEventListener('sidequest_backend_ready', handleBackendReady);
    return () => { window.removeEventListener('sidequest_auth_changed', handleAuth); window.removeEventListener('storage', handleAuth); window.removeEventListener('sidequest_backend_ready', handleBackendReady); };
  }, []);

  useEffect(() => {
    const tag = new URLSearchParams(window.location.search).get("tag");
    if (tag) setSelectedTag(tag);
  }, []);

  const filteredPosts = useMemo(() => {
    let result = posts.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.ownerName.toLowerCase().includes(q) ||
        (p.guildTag && p.guildTag.toLowerCase().includes(q)) ||
        p.requiredSkills.some((s) => s.toLowerCase().includes(q));

      const matchesTag =
        selectedTag === "All Feed" ||
        (selectedTag === "Open Roles" && p.roles.some((r) => r.filled < r.total)) ||
        (p.guildTag && p.guildTag.toLowerCase().includes(selectedTag.toLowerCase())) ||
        p.requiredSkills.some((s) => s.toLowerCase().includes(selectedTag.toLowerCase()));

      return matchesSearch && matchesTag;
    });

    if (sortBy === "latest") {
      result = [...result].sort((a, b) => new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime());
    } else if (sortBy === "top") {
      result = [...result].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
    } else if (sortBy === "open") {
      result = [...result].sort((a, b) => {
        const openA = a.roles.reduce((acc, r) => acc + (r.total - r.filled), 0);
        const openB = b.roles.reduce((acc, r) => acc + (r.total - r.filled), 0);
        return openB - openA;
      });
    }

    return result;
  }, [posts, searchQuery, selectedTag, sortBy]);

  const handleApplyClick = (quest: QuestPost) => {
    const hasToken = typeof window !== "undefined" && !!localStorage.getItem("sidequest_jwt_token");
    if (!hasToken) {
      setAuthModalRedirectTo(getCurrentUrl());
      setIsAuthModalOpen(true);
    } else {
      setApplyQuest({
        id: quest.id,
        title: quest.title,
        description: quest.description,
        ownerName: quest.ownerName,
        roles: quest.roles.map((r) => ({
          id: r.id,
          roleTitle: r.roleTitle,
          filled: r.filled,
          total: r.total,
          requiredSkills: quest.requiredSkills,
        })),
      });
    }
  };

  const handleViewApplications = (quest: QuestPost) => {
    router.push(`/my-quests?viewApplicants=${quest.id}`);
  };

  const isOwner = (quest: QuestPost): boolean => {
    const qOwnerId = String((quest as any).ownerId ?? "");
    const qOwnerEmail = String((quest as any).ownerEmail ?? "").toLowerCase();
    return (!!currentUserId && !!qOwnerId && qOwnerId === currentUserId) ||
           (!!currentUserEmail && !!qOwnerEmail && qOwnerEmail === currentUserEmail);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-[#121212] dark:text-[#ededed] flex flex-col">
      {/* Top Navbar */}
<Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onOpenCreateQuest={handleOpenCreateQuest}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
/>

      {/* Main Container with Sidebar + Feed Layout */}
      <div className="flex-1 flex">
        {/* Reddit-style Left Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpenCreateQuest={handleOpenCreateQuest}
          selectedTag={selectedTag}
          onSelectTag={(tag) => setSelectedTag(tag)}
        />

        {/* Content Area (offset by 256px on desktop) */}
        <div className="flex-1 lg:pl-64 flex justify-center relative z-0">
          <main className="w-full max-w-6xl px-4 sm:px-6 py-6 grid grid-cols-1 gap-8 xl:grid-cols-12 relative z-0">
            {/* Center Feed Column */}
            <div className="xl:col-span-8 space-y-4">
              {/* Sort & Feed Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-[#282828] dark:bg-[#1c1c1c]">
                {/* Sort Option Pills */}
                <div className="flex items-center gap-1">
                  {(
                    [
                      { key: "best", label: "Best", icon: Sparkles },
                      { key: "latest", label: "Latest", icon: Clock },
                      { key: "top", label: "Top", icon: TrendingUp },
                      { key: "open", label: "Open Spots", icon: Users },
                    ] as const
                  ).map((st) => {
                    const Icon = st.icon;
                    const isActive = sortBy === st.key;
                    return (
                      <button
                        key={st.key}
                        type="button"
                        onClick={() => setSortBy(st.key)}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                          isActive
                            ? "bg-[#3ecf8e]/15 text-[#3ecf8e] shadow-sm"
                            : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-[#232323] dark:hover:text-zinc-100"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span>{st.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Active Tag Indicator */}
                {selectedTag !== "All Feed" && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400 dark:text-zinc-500">Filtered by:</span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#3ecf8e]/10 px-2 py-0.5 text-xs font-medium text-[#3ecf8e]">
                      {selectedTag}
                      <button
                        type="button"
                        onClick={() => setSelectedTag("All Feed")}
                        className="text-[#3ecf8e] hover:text-[#34b27b]"
                      >
                        &times;
                      </button>
                    </span>
                  </div>
                )}
              </div>

              {/* Composer Box Prompt */}
              <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-sm dark:border-[#282828] dark:bg-[#1c1c1c]">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3ecf8e]/15 text-xs font-bold text-[#3ecf8e]">
                    AR
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenCreateQuest}
                    className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-left text-xs text-slate-400 hover:border-slate-300 hover:bg-slate-100/70 transition-all dark:border-[#282828] dark:bg-[#161616] dark:text-zinc-500 dark:hover:border-[#383838] dark:hover:bg-[#202020]"
                  >
                    Post a quest or recruit party members for your project...
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenCreateQuest}
                    className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-[#3ecf8e] px-4 py-2 text-xs font-semibold text-[#042f1a] transition-all hover:bg-[#34b27b]"
                  >
                    <Plus className="h-3.5 w-3.5" /> Post
                  </button>
                </div>
              </div>

              {/* Scrollable Feed List */}
              <div className="space-y-4">
                {loading ? (
                  <div className="space-y-4">
                    {[1,2,3].map((i) => (
                      <div key={i} className="animate-pulse rounded-xl border border-slate-200 bg-white p-5 dark:border-[#282828] dark:bg-[#1c1c1c]">
                        <div className="flex items-center gap-3"><div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-[#2a2a2a]" /><div className="space-y-2 flex-1"><div className="h-3 w-1/3 rounded bg-slate-200 dark:bg-[#2a2a2a]" /><div className="h-2 w-1/4 rounded bg-slate-100 dark:bg-[#232323]" /></div></div>
                        <div className="mt-4 h-4 w-3/4 rounded bg-slate-200 dark:bg-[#2a2a2a]" />
                        <div className="mt-2 h-3 w-full rounded bg-slate-100 dark:bg-[#232323]" />
                        <div className="mt-2 h-3 w-5/6 rounded bg-slate-100 dark:bg-[#232323]" />
                      </div>
                    ))}
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center dark:border-[#282828] dark:bg-[#1c1c1c]">
                    <XCircle className="h-8 w-8 text-slate-300 dark:text-zinc-600 mb-2" />
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-zinc-300">No Quests in Feed</h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500 max-w-xs">
                      Try adjusting search filters or post a new quest for campus peers!
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedTag("All Feed");
                        setSortBy("best");
                      }}
                      className="mt-4 rounded-lg bg-[#3ecf8e] px-4 py-1.5 text-xs font-semibold text-[#042f1a] hover:bg-[#34b27b]"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  filteredPosts.map((post) => {
                    const owned = isOwner(post);
                    return (
                    <QuestCard
                      key={post.id}
                      id={post.id}
                      title={post.title}
                      description={post.description}
                      ownerName={post.ownerName}
                      ownerId={post.ownerId}
                      ownerAvatarUrl={post.ownerAvatarUrl}
                      ownerRole={post.ownerRole}
                      guildTag={post.guildTag}
                      datePosted={post.datePosted}
                      requiredSkills={post.requiredSkills}
                      roles={post.roles}
                      repoLink={post.repoLink}
                      initialUpvotes={post.upvotes}
                      initialDownvotes={post.downvotes}
                      initialUserVote={post.userVote}
                      commentsCount={post.commentsCount}
                      joinLabel={owned ? "View Applications" : "Apply to Join"}
                      onJoin={() => owned ? handleViewApplications(post) : handleApplyClick(post)}
                      onProfileClick={(ownerId) => setSelectedAuthorId(ownerId)}
                      isAuthenticated={typeof window !== "undefined" && !!localStorage.getItem("sidequest_jwt_token")}
                      onRequireAuth={() => {
                        setAuthModalRedirectTo(getCurrentUrl());
                        setIsAuthModalOpen(true);
                      }}
                    />
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Secondary Sidebar Widgets */}
            <div className="hidden xl:block xl:col-span-4 space-y-5 sticky top-20 self-start z-0">
              {/* Widget 1: Campus Hackathon Spotlight */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#282828] dark:bg-[#1c1c1c]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#3ecf8e]/15 text-[#3ecf8e]">
                      <Trophy className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-[#ededed]">
                      Hackathon Spotlight
                    </span>
                  </div>
                  <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-500">
                    Live
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-[#ededed]">
                  Campus Spring Buildathon 2026
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                  Form parties of 3-4 members. 48h build sprint with $5,000 prize pool.
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-[#282828]">
                  <span className="text-slate-500 dark:text-zinc-400">28 Parties Registered</span>
                  <button
                    type="button"
                    onClick={handleOpenCreateQuest}
                    className="font-semibold text-[#3ecf8e] hover:underline"
                  >
                    Assemble Party &rarr;
                  </button>
                </div>
              </div>

              {/* Widget 2: Student Guild Leaderboard */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#282828] dark:bg-[#1c1c1c]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-[#ededed] mb-3">
                  Top Campus Guilds
                </h3>
                <div className="space-y-3 text-xs">
                  <Link href="/communities/cs-student-guild" className="flex items-center justify-between rounded-lg px-1 py-1 transition-colors hover:bg-slate-50 dark:hover:bg-[#232323]">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-[#3ecf8e]">1</span>
                      <span className="font-medium text-slate-800 dark:text-zinc-200">CS Student Guild</span>
                    </div>
                    <span className="text-[11px] text-slate-400 dark:text-zinc-500">142 members</span>
                  </Link>
                  <Link href="/communities/hackathon-sprint-squad" className="flex items-center justify-between rounded-lg px-1 py-1 transition-colors hover:bg-slate-50 dark:hover:bg-[#232323]">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-amber-400">2</span>
                      <span className="font-medium text-slate-800 dark:text-zinc-200">Hackathon Sprint Squad</span>
                    </div>
                    <span className="text-[11px] text-slate-400 dark:text-zinc-500">98 members</span>
                  </Link>
                  <Link href="/communities/uiux-design-studio" className="flex items-center justify-between rounded-lg px-1 py-1 transition-colors hover:bg-slate-50 dark:hover:bg-[#232323]">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-slate-400">3</span>
                      <span className="font-medium text-slate-800 dark:text-zinc-200">UI/UX Design Studio</span>
                    </div>
                    <span className="text-[11px] text-slate-400 dark:text-zinc-500">64 members</span>
                  </Link>
                </div>
              </div>

            </div>
          </main>
        </div>
      </div>

      {/* Modals */}
      <CreateQuestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onQuestCreated={fetchPosts}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        redirectTo={authModalRedirectTo}
      />

      <ApplyModal
        isOpen={!!applyQuest}
        quest={applyQuest}
        onClose={() => setApplyQuest(null)}
        onSuccess={fetchPosts}
      />

      <PublicProfileModal userId={selectedAuthorId} onClose={() => setSelectedAuthorId(null)} />
    </div>
  );
}
