"use client";

import { useEffect, useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import QuestCard, { PartyRole } from "@/components/QuestCard";
import CreateQuestModal from "@/components/CreateQuestModal";
import ApplyModal, { QuestForApply } from "@/components/ApplyModal";
import { api } from "@/lib/api";
import Link from "next/link";
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
  ownerAvatarUrl?: string;
  ownerRole?: string;
  guildTag?: string;
  datePosted: string;
  requiredSkills: string[];
  roles: PartyRole[];
  repoLink?: string;
  upvotes?: number;
  commentsCount?: number;
}

const mockFeedPosts: QuestPost[] = [
  {
    id: "q1",
    title: "Campus Ride-Share Matcher (Hackathon MVP)",
    description:
      "Building a lightweight ride-share matcher for students commuting between North and South campus. Tight 48-hour deadline for upcoming HackMIT submission. Need reliable team players!",
    ownerName: "Priya Nair",
    ownerRole: "Full Stack Lead",
    guildTag: "CampusBuilds",
    datePosted: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    requiredSkills: ["React", "Node.js", "PostgreSQL", "Tailwind CSS"],
    roles: [
      { id: "r101", roleTitle: "Backend Lead", filled: 1, total: 1 },
      { id: "r102", roleTitle: "UI/UX Designer", filled: 0, total: 1 },
      { id: "r103", roleTitle: "Frontend Dev", filled: 1, total: 2 },
    ],
    repoLink: "https://github.com/campus-hacks/rideshare",
    upvotes: 48,
    commentsCount: 9,
  },
  {
    id: "q2",
    title: "Automated AI Lecture Summarizer & Flashcard Generator",
    description:
      "Fine-tuning an open-source local LLM to transcribe lecture audio and generate bulleted study notes & active recall flashcards. Seeking Python ML & DevOps contributors.",
    ownerName: "Devon Chen",
    ownerRole: "AI Researcher",
    guildTag: "AILab",
    datePosted: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    requiredSkills: ["Python", "PyTorch", "FastAPI", "Docker"],
    roles: [
      { id: "r201", roleTitle: "ML Engineer", filled: 0, total: 2 },
      { id: "r202", roleTitle: "DevOps / Infra", filled: 1, total: 1 },
    ],
    upvotes: 35,
    commentsCount: 6,
  },
  {
    id: "q3",
    title: "SideQuest: Gamified Skill Matrix & Party Matchmaker",
    description:
      "RPG-styled campus quest board & peer-verified skill progression tree. Integrating high-performance Spring Boot backend microservices with Next.js frontend.",
    ownerName: "Alex Rivera",
    ownerRole: "Project Founder",
    guildTag: "CSGuild",
    datePosted: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    requiredSkills: ["Java", "Spring Boot", "React", "Docker", "PostgreSQL"],
    roles: [
      { id: "r301", roleTitle: "Backend Architect", filled: 1, total: 1 },
      { id: "r302", roleTitle: "Frontend Engineer", filled: 1, total: 2 },
      { id: "r303", roleTitle: "Quality Auditor", filled: 0, total: 1 },
    ],
    repoLink: "https://github.com/sidequest-dev/sidequest",
    upvotes: 72,
    commentsCount: 14,
  },
  {
    id: "q4",
    title: "Autonomous Dorm Coffee Delivery Bot",
    description:
      "Hardware + IoT delivery rover for late night dorm deliveries during midterms. Closed party rosters currently working on obstacle avoidance sensors.",
    ownerName: "Marcus Vance",
    ownerRole: "Robotics Lead",
    guildTag: "IoTLab",
    datePosted: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    requiredSkills: ["Python", "Raspberry Pi", "C++", "Computer Vision"],
    roles: [
      { id: "r401", roleTitle: "Hardware Lead", filled: 1, total: 1 },
      { id: "r402", roleTitle: "Mobile Dev", filled: 1, total: 1 },
    ],
    upvotes: 29,
    commentsCount: 4,
  },
];

type SortOption = "best" | "latest" | "top" | "open";

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [posts, setPosts] = useState<QuestPost[]>(mockFeedPosts);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("All Feed");
  const [sortBy, setSortBy] = useState<SortOption>("best");

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [applyQuest, setApplyQuest] = useState<QuestForApply | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await api.projects.list();

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
          requiredSkills: (item.roles || []).flatMap((r: any) =>
            (r.requiredSkills || []).map((s: any) => s.skillName)
          ).filter((val: string, idx: number, self: string[]) => self.indexOf(val) === idx),
          roles: (item.roles || []).map((r: any) => ({
            id: r.id,
            roleTitle: r.roleTitle,
            filled: r.filledSpots || 0,
            total: r.spotCount || 1,
          })),
          upvotes: 20 + (item.roles ? item.roles.length * 5 : 0),
          commentsCount: 2 + (item.roles ? item.roles.length : 0),
        }));
        setPosts(mapped);
      } else {
        setPosts(mockFeedPosts);
      }
    } catch {
      setPosts(mockFeedPosts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
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
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-[#121212] dark:text-[#ededed] flex flex-col">
      {/* Top Navbar */}
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onOpenCreateQuest={() => setIsCreateModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Container with Sidebar + Feed Layout */}
      <div className="flex-1 flex">
        {/* Reddit-style Left Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpenCreateQuest={() => setIsCreateModalOpen(true)}
          selectedTag={selectedTag}
          onSelectTag={(tag) => setSelectedTag(tag)}
        />

        {/* Content Area (offset by 256px on desktop) */}
        <div className="flex-1 lg:pl-64 flex justify-center">
          <main className="w-full max-w-6xl px-4 sm:px-6 py-6 grid grid-cols-1 gap-8 xl:grid-cols-12">
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
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-left text-xs text-slate-400 hover:border-slate-300 hover:bg-slate-100/70 transition-all dark:border-[#282828] dark:bg-[#161616] dark:text-zinc-500 dark:hover:border-[#383838] dark:hover:bg-[#202020]"
                  >
                    Post a quest or recruit party members for your project...
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-[#3ecf8e] px-4 py-2 text-xs font-semibold text-[#042f1a] transition-all hover:bg-[#34b27b]"
                  >
                    <Plus className="h-3.5 w-3.5" /> Post
                  </button>
                </div>
              </div>

              {/* Scrollable Feed List */}
              <div className="space-y-4">
                {loading ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-16 text-slate-400 dark:border-[#282828] dark:bg-[#1c1c1c]">
                    <RefreshCw className="h-6 w-6 animate-spin text-[#3ecf8e] mb-2" />
                    <span className="text-xs">Scanning quest feed...</span>
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
                  filteredPosts.map((post) => (
                    <QuestCard
                      key={post.id}
                      id={post.id}
                      title={post.title}
                      description={post.description}
                      ownerName={post.ownerName}
                      ownerAvatarUrl={post.ownerAvatarUrl}
                      ownerRole={post.ownerRole}
                      guildTag={post.guildTag}
                      datePosted={post.datePosted}
                      requiredSkills={post.requiredSkills}
                      roles={post.roles}
                      repoLink={post.repoLink}
                      initialUpvotes={post.upvotes}
                      commentsCount={post.commentsCount}
                      onJoin={() => handleApplyClick(post)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Right Secondary Sidebar Widgets */}
            <div className="hidden xl:block xl:col-span-4 space-y-5 sticky top-20 self-start">
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
                    onClick={() => setIsCreateModalOpen(true)}
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

      <ApplyModal
        isOpen={!!applyQuest}
        quest={applyQuest}
        onClose={() => setApplyQuest(null)}
        onSuccess={fetchPosts}
      />
    </div>
  );
}
