"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import PlayerProfileCard, { PlayerSkill, ActiveStatus } from "@/components/PlayerProfileCard";
import ConnectedHandles from "@/components/ConnectedHandles";
import BadgeGrid from "@/components/achievements/BadgeGrid";
import { mockAchievements, mockCampusBadges } from "@/lib/skillsData";
import { api, getStoredToken } from "@/lib/api";
import { User, Camera, Trash2, Edit2, CreditCard, Lock } from "lucide-react";
import MetalPlayerCard, { PlayerCardConfig } from "@/components/MetalPlayerCard";
import CardCustomizationModal from "@/components/CardCustomizationModal";
import AccountDetails from "@/components/AccountDetails";
import AuthModal from "@/components/AuthModal";
import { getHighestTier, getTierTokens, getLevelFromSkills } from "@/lib/tierConfig";

// Kept for reference only - not used as default for authenticated users (fresh user = zeroed Bronze/0)
// Previously: 6 hardcoded demo skills that leaked for new users.
const initialSkills: PlayerSkill[] = [];

export default function ProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeStatus, setActiveStatus] = useState<ActiveStatus>("OPEN_TO_JOIN");
  const [isAuthed, setIsAuthed] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<"signin" | "signup">("signin");
  
  // Profile settings - zeroed defaults for fresh user (Bronze/0). No mock "Alex Rivera".
  const [profile, setProfile] = useState({
    fullName: "",
    major: "",
    bio: "",
    skills: initialSkills as PlayerSkill[],
  });

  // Profile Header States - start empty, populated only from real DB/localStorage
  const [displayName, setDisplayName] = useState("");
  const [userHandle, setUserHandle] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [academicMajor, setAcademicMajor] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Avatar upload
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Metal Player Card Config
  const [cardConfig, setCardConfig] = useState<PlayerCardConfig>({
    tier: "PLATINUM",
    backgroundType: "default",
    pattern: "circuit",
    showAvatar: true,
    showUsername: true,
    showLevel: true,
    showTier: true,
    showMainSkill: true,
    showQuestCount: true,
    showAchievementCount: true,
    showCampusBadgeCount: true,
    showGithub: true,
    customTitle: "Frontend Developer",
  });
  
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  
  // Shared badge status filter state
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  // Bio state and editing draft state
  const [bio, setBio] = useState<string>("");
  const [draftBio, setDraftBio] = useState<string>("");

  // Auth check
  useEffect(() => {
    const checkAuth = () => setIsAuthed(!!getStoredToken());
    checkAuth();
    window.addEventListener("sidequest_auth_changed", checkAuth);
    window.addEventListener("storage", checkAuth);
    return () => {
      window.removeEventListener("sidequest_auth_changed", checkAuth);
      window.removeEventListener("storage", checkAuth);
    };
  }, []);
  const openAuth = (tab: "signin" | "signup") => { setAuthInitialTab(tab); setAuthModalOpen(true); };

  // Initial loads - only when authenticated; zeroed state otherwise
  useEffect(() => {
    if (!isAuthed) return;
    api.profiles.getMe()
      .then((res) => {
        if (res) {
          const mappedName = res.fullName || "";
          const mappedMajor = res.major || "";
          // Fresh user: no skills -> empty array, not mock fallback
          const mappedSkills = res.skills && res.skills.length > 0 
            ? res.skills.map((s: any) => ({
                id: s.id || s.skillId || Math.random().toString(),
                skillName: s.skillName,
                category: s.category,
                rankTier: s.rankTier,
                verified: s.verificationStatus === "VERIFIED",
              })) 
            : [];

          setProfile((prev) => ({
            ...prev,
            fullName: mappedName,
            major: mappedMajor,
            skills: mappedSkills,
          }));

          const mappedStatus: ActiveStatus = res.activeStatus === "IN_A_PARTY"
            ? "IN_A_PARTY"
            : res.activeStatus === "INACTIVE" || res.activeStatus === "OFFLINE"
            ? "OFFLINE"
            : res.activeStatus === "ACTIVE" || res.activeStatus === "OPEN_TO_JOIN"
            ? "OPEN_TO_JOIN"
            : "OPEN_TO_JOIN";
          setActiveStatus(mappedStatus);

          // Only seed display fields from backend if localStorage empty (no leak of previous user's data)
          if (!localStorage.getItem("sidequest_username") && mappedName) setDisplayName(mappedName);
          else if (localStorage.getItem("sidequest_username")) setDisplayName(localStorage.getItem("sidequest_username") || mappedName);
          if (!localStorage.getItem("sidequest_major") && mappedMajor) setAcademicMajor(mappedMajor);
          if (localStorage.getItem("sidequest_email")) setEmailAddress(localStorage.getItem("sidequest_email") || res.email || "");
          else if (res.email) setEmailAddress(res.email);
          if (localStorage.getItem("sidequest_user_handle")) setUserHandle(localStorage.getItem("sidequest_user_handle") || "");
        }
      })
      .catch(() => {});
  }, [isAuthed]);

  // Sync state from LocalStorage on component mount & updates - gated by auth
  useEffect(() => {
    const loadLocalStorage = () => {
      if (!isAuthed) {
        // Unauthenticated: ensure zeroed state, no mock bio/handle leak
        setAvatarUrl(null);
        setBio("");
        setDisplayName("");
        setUserHandle("");
        setEmailAddress("");
        setAcademicMajor("");
        return;
      }
      const storedAvatar = localStorage.getItem("sidequest_avatar");
      setAvatarUrl(storedAvatar);

      const storedBio = localStorage.getItem("sidequest_bio");
      const activeBio = storedBio !== null ? storedBio : "";
      setBio(activeBio);
      setProfile((prev) => ({ ...prev, bio: activeBio }));

      const storedName = localStorage.getItem("sidequest_username");
      if (storedName) {
        setDisplayName(storedName);
        setProfile((prev) => ({ ...prev, fullName: storedName }));
      }
      
      const storedHandle = localStorage.getItem("sidequest_user_handle");
      if (storedHandle) setUserHandle(storedHandle);
      else setUserHandle("");

      const storedEmail = localStorage.getItem("sidequest_email");
      if (storedEmail) setEmailAddress(storedEmail);

      const storedMajor = localStorage.getItem("sidequest_major");
      if (storedMajor) {
        setAcademicMajor(storedMajor);
        setProfile((prev) => ({ ...prev, major: storedMajor }));
      }
      const storedConfig = localStorage.getItem("sidequest_card_config");
      if (storedConfig) {
        try {
          setCardConfig(JSON.parse(storedConfig));
        } catch (e) {}
      } else {
        // Fresh user Bronze fallback, not PLATINUM mock
        const highest = getHighestTier(profile.skills.map((s) => s.rankTier));
        setCardConfig((prev) => ({ ...prev, tier: highest }));
      }
    };

    loadLocalStorage();

    if (window.location.search.includes("customize=true") || window.location.hash.includes("customize")) {
      setIsCustomizerOpen(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const handleOpenCustomizer = () => setIsCustomizerOpen(true);
    window.addEventListener("sidequest_open_card_customizer", handleOpenCustomizer);
    
    return () => {
      window.removeEventListener("sidequest_open_card_customizer", handleOpenCustomizer);
    };
  }, [profile.skills, isAuthed]);

  // Scroll to anchored sections when navigating via hash (e.g., from Sidebar > Verified Badges or ProfileMenu > Account Details)
  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash;
      if (hash === "#badges" || hash === "#account-details") {
        setTimeout(() => {
          document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
      }
    };
    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarUrl(result);
        localStorage.setItem("sidequest_avatar", result);
        window.dispatchEvent(new CustomEvent("sidequest_avatar_changed"));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAvatarUrl(null);
    localStorage.removeItem("sidequest_avatar");
    window.dispatchEvent(new CustomEvent("sidequest_avatar_changed"));
  };

  const handleSaveProfile = () => {
    const trimmedBio = draftBio.trim();
    localStorage.setItem("sidequest_username", displayName);
    localStorage.setItem("sidequest_user_handle", userHandle);
    localStorage.setItem("sidequest_email", emailAddress);
    localStorage.setItem("sidequest_major", academicMajor);
    localStorage.setItem("sidequest_bio", trimmedBio);

    setBio(trimmedBio);
    setProfile((prev) => ({
      ...prev,
      fullName: displayName,
      major: academicMajor,
      bio: trimmedBio,
    }));

    if (getStoredToken()) {
      const statusMapping = activeStatus === "OPEN_TO_JOIN" ? "ACTIVE" : activeStatus === "OFFLINE" ? "INACTIVE" : "IN_A_PARTY";

      api.profiles.updateMe({
        fullName: displayName,
        major: academicMajor,
        activeStatus: statusMapping,
      })
      .then((res) => {
        console.log("Profile persisted on backend:", res);
        window.dispatchEvent(new CustomEvent("sidequest_auth_changed"));
      })
      .catch((err) => {
        console.error("Failed to persist profile on backend:", err);
      });
    }

    setIsEditingProfile(false);
    window.dispatchEvent(new CustomEvent("sidequest_avatar_changed"));
  };

  const handleSaveCardConfig = (newConfig: PlayerCardConfig) => {
    setCardConfig(newConfig);
    localStorage.setItem("sidequest_card_config", JSON.stringify(newConfig));
  };

  const persistActiveStatus = (newStatus: ActiveStatus) => {
    setActiveStatus(newStatus);
    setIsStatusDropdownOpen(false);
    if (!getStoredToken()) return;
    const statusMapping = newStatus === "OPEN_TO_JOIN" ? "ACTIVE" : newStatus === "OFFLINE" ? "INACTIVE" : "IN_A_PARTY";
    const currentFullName = displayName || profile.fullName || "New Builder";
    const currentMajor = academicMajor || profile.major || "Undeclared";
    api.profiles.updateMe({
      fullName: currentFullName,
      major: currentMajor,
      activeStatus: statusMapping,
    }).then(() => window.dispatchEvent(new CustomEvent("sidequest_auth_changed"))).catch(()=>{});
  };

  const highestRank = getHighestTier(profile.skills.map((s) => s.rankTier));
  const highestTokens = getTierTokens(highestRank);

  // Fresh user detection - zeroed stats
  const isNewUser = isAuthed && profile.skills.length === 0;
  const displayLevel = getLevelFromSkills(profile.skills.length);
  const displayQuestsCount = isNewUser ? 0 : 27;
  const displayAchievementsCount = isNewUser ? 0 : 0; // no unlocked for fresh user
  const displayBadgesCount = isNewUser ? 0 : 0;

  const getInitials = (name: string) => {
    if (!name || !name.trim()) return "?";
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "?";
  };

  // Filter list computed values - for fresh user, show zeroed (no earned)
  const [selectedRarity] = useState<string>("all");

  const zeroedAchievements = useMemo(() => mockAchievements.map(b => ({ ...b, status: "locked" as const, progress: 0, currentValue: 0, earnedDate: undefined })), []);
  const zeroedCampusBadges = useMemo(() => mockCampusBadges.map(b => ({ ...b, status: "locked" as const, progress: 0, currentValue: 0, earnedDate: undefined })), []);

  const sourceAchievements = isNewUser ? zeroedAchievements : mockAchievements;
  const sourceCampusBadges = isNewUser ? zeroedCampusBadges : mockCampusBadges;

  const filteredAchievements = useMemo(() => {
    if (selectedStatus === "all") return sourceAchievements;
    return sourceAchievements.filter((badge) => badge.status === selectedStatus);
  }, [selectedStatus, sourceAchievements]);

  const filteredCampusBadges = useMemo(() => {
    if (selectedStatus === "all") return sourceCampusBadges;
    return sourceCampusBadges.filter((badge) => badge.status === selectedStatus);
  }, [selectedStatus, sourceCampusBadges]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-[#121212] dark:text-[#ededed] flex flex-col">
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="flex-1 lg:pl-64 flex justify-center">
          {!isAuthed ? (
            <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-[#282828] dark:bg-[#1c1c1c] flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#3ecf8e]/10 text-[#3ecf8e] mb-4">
                  <Lock className="h-6 w-6" />
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-[#ededed]">Please login or register to view your profile.</h2>
                <p className="mt-1 max-w-md text-xs text-slate-500 dark:text-zinc-400">Sign in to view your Bronze starter rank, skills, and quests. New accounts start with 0 completed skills and no badges.</p>
                <div className="mt-5 flex gap-3">
                  <button type="button" onClick={() => openAuth("signin")} className="rounded-lg bg-[#3ecf8e] px-5 py-2 text-xs font-bold text-[#042f1a] hover:bg-[#34b27b]">Login</button>
                  <button type="button" onClick={() => openAuth("signup")} className="rounded-lg border border-slate-200 bg-white px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-[#282828] dark:bg-[#161616] dark:text-zinc-300">Register</button>
                </div>
              </div>
            </main>
          ) : (
          <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            
            {/* Header / Account Section */}
            <header className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#282828] dark:bg-[#1c1c1c] dark:shadow-none flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
              <div className="flex items-center gap-4 shrink-0">
                {/* Avatar */}
                <div 
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-[#232323] ring-2 ring-[#3ecf8e]/30 overflow-hidden"
                >
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt={profile.fullName} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-slate-700 dark:text-zinc-200">{getInitials(profile.fullName)}</span>
                  )}
                </div>

                <div>
                  <div className="flex items-baseline gap-2">
                    <h1 className="text-lg font-extrabold text-slate-900 dark:text-[#ededed] leading-none">
                      {profile.fullName}
                    </h1>
                    <span className="text-xs font-normal text-slate-500 dark:text-zinc-400">
                      {userHandle}
                    </span>
                  </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                    Level {displayLevel} &middot; <span className="font-semibold" style={{ color: highestTokens.dot }}>{highestRank} Rank</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Collaboration Availability Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-[#282828] dark:bg-[#1c1c1c] dark:text-zinc-300 dark:hover:bg-[#232323] transition-colors flex items-center gap-1.5"
                  >
                    <span>
                      {activeStatus === "OPEN_TO_JOIN" ? "🟢 Open" : activeStatus === "IN_A_PARTY" ? "🟡 In Party" : "⚪ Offline"}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-normal">
                      Collaboration
                    </span>
                  </button>

                  {isStatusDropdownOpen && (
                    <>
                      {/* Click overlay to close */}
                      <div className="fixed inset-0 z-10" onClick={() => setIsStatusDropdownOpen(false)} />
                      
                      {/* Dropdown Menu */}
                      <div className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-[#282828] dark:bg-[#1c1c1c] z-20 animate-in fade-in slide-in-from-top-1 duration-100">
                        <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                          Set Availability
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {(["OPEN_TO_JOIN", "IN_A_PARTY", "OFFLINE"] as ActiveStatus[]).map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => persistActiveStatus(st)}
                              className={`rounded-md px-2.5 py-1.5 text-left text-xs font-medium transition-all flex items-center justify-between ${
                                activeStatus === st
                                  ? "bg-[#3ecf8e]/10 text-[#3ecf8e] font-semibold"
                                  : "text-slate-600 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-[#232323]"
                              }`}
                            >
                              <span>
                                {st === "OPEN_TO_JOIN" ? "🟢 Open to Join" : st === "IN_A_PARTY" ? "🟡 In Active Party" : "⚪ Offline"}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {!isEditingProfile ? (
                  <button
                    type="button"
                    onClick={() => {
                      setDraftBio(bio);
                      setIsEditingProfile(true);
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-[#282828] dark:bg-[#1c1c1c] dark:text-zinc-400 dark:hover:bg-[#232323] transition-colors flex items-center gap-1.5"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    Edit Profile
                  </button>
                ) : (
                  <span className="text-xs text-slate-400">Editing Profile details...</span>
                )}
              </div>
            </header>

            {/* Profile Editing Form (Conditional) */}
            {isEditingProfile && (
              <div className="rounded-xl border border-[#3ecf8e]/30 bg-[#3ecf8e]/5 p-5 dark:bg-[#3ecf8e]/10 space-y-4 animate-in slide-in-from-top-2 duration-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#3ecf8e]">Edit Profile Details</h3>
                
                {/* Profile Image Management inside Edit Profile */}
                <div className="flex flex-col items-center gap-3 pb-4 border-b border-[#3ecf8e]/10">
                  <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-[#232323] ring-2 ring-[#3ecf8e]/30 overflow-hidden">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarUrl} alt="Avatar Preview" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xl font-bold text-slate-700 dark:text-zinc-200">{getInitials(profile.fullName)}</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAvatarClick}
                      className="rounded-lg bg-[#3ecf8e] px-4 py-1.5 text-xs font-bold text-[#042f1a] hover:bg-[#34b27b] transition-colors"
                    >
                      Change Image
                    </button>
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={handleAvatarRemove}
                        className="rounded-lg border border-red-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:bg-[#1c1c1c] dark:text-red-400 dark:hover:bg-red-950/20 transition-colors"
                      >
                        Remove Image
                      </button>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
<div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1">Bio / About</label>
                    <textarea
                      aria-label="Bio / About"
                      value={draftBio}
                      onChange={(e) => setDraftBio(e.target.value)}
                      maxLength={250}
                      rows={3}
                      placeholder="Write something about yourself..."
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#3ecf8e] dark:border-[#282828] dark:bg-[#1c1c1c] dark:text-zinc-100 resize-y min-h-[80px]"
                    />
                    <div className="mt-1 flex justify-end text-[10px] text-slate-400 dark:text-zinc-500">
                      {draftBio.length} / 250
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-[#282828] dark:bg-[#1c1c1c] dark:text-zinc-400 dark:hover:bg-[#232323] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    className="rounded-lg bg-[#3ecf8e] px-4 py-1.5 text-xs font-bold text-[#042f1a] hover:bg-[#34b27b] transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Metal Achievement Card + Skill Tag Summary */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              {/* Custom Metal Player Card Section */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#282828] dark:bg-[#1c1c1c] flex flex-col justify-between h-full">
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-3.5">
                    Metal Achievement Card
                  </h2>
                  <div className="py-2 flex justify-center">
                    <MetalPlayerCard 
                      config={cardConfig} 
                      userData={{
                        fullName: profile.fullName || displayName || "New Builder",
                        level: displayLevel,
                        skillsCount: profile.skills.length,
                        questsCount: displayQuestsCount,
                        achievementsCount: displayAchievementsCount,
                        badgesCount: displayBadgesCount,
                        avatarUrl: avatarUrl || undefined,
                        mainSkill: profile.skills[0]?.skillName,
                      }} 
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCustomizerOpen(true)}
                  className="mt-4 w-full rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-300 py-2.5 text-xs font-bold text-slate-700 dark:bg-[#161616] dark:border-[#282828] dark:text-zinc-300 dark:hover:border-[#383838] transition-all flex items-center justify-center gap-2"
                >
                  <CreditCard className="h-4 w-4 text-[#3ecf8e]" />
                  Customize Metal Card
                </button>
              </div>

              {/* Skill Tag Summary */}
              <div className="h-full">
                <PlayerProfileCard
                  fullName={profile.fullName}
                  major={profile.major}
                  activeStatus={activeStatus}
                  skills={profile.skills}
                  bio={profile.bio}
                  avatarUrl={avatarUrl}
                  className="h-full flex flex-col justify-between"
                />
              </div>
            </div>

            {/* Achievements & Campus Badges */}
            <div id="badges" className="mt-10 scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-[#ededed] mb-6">
                Achievements & Campus Badges
              </h2>
              
              {/* Shared Status Filter Bar */}
              <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-[#282828] dark:bg-[#1c1c1c]">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mr-2">
                  Status:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "All Badges" },
                    { value: "earned", label: "Earned" },
                    { value: "in-progress", label: "In Progress" },
                    { value: "locked", label: "Locked" },
                  ].map((filter) => {
                    const isActive = selectedStatus === filter.value;
                    return (
                      <button
                        key={filter.value}
                        type="button"
                        onClick={() => setSelectedStatus(filter.value)}
                        className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                          isActive
                            ? "bg-[#3ecf8e] text-[#042f1a] font-bold shadow-sm"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 dark:bg-[#232323] dark:text-zinc-400 dark:hover:bg-[#2c2c2c]"
                        }`}
                      >
                        {filter.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#282828] dark:bg-[#1c1c1c] h-full flex flex-col">
                  <h3 className="text-lg font-semibold leading-none mb-6 text-slate-900 dark:text-[#ededed]">
                    Achievements
                  </h3>
                  <div className="flex-1">
                    <BadgeGrid badges={filteredAchievements} unfilteredBadges={sourceAchievements} />
                  </div>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#282828] dark:bg-[#1c1c1c] h-full flex flex-col">
                  <h3 className="text-lg font-semibold leading-none mb-6 text-slate-900 dark:text-[#ededed]">
                    Campus Badges
                  </h3>
                  <div className="flex-1">
                    <BadgeGrid badges={filteredCampusBadges} unfilteredBadges={sourceCampusBadges} />
                  </div>
                </section>
              </div>
            </div>

            {/* Remaining Profile Sections */}
            <div id="account-details" className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch scroll-mt-20">
              <div className="flex flex-col justify-between h-full">
                {/* Connected Handles */}
                <ConnectedHandles className="w-full" />
              </div>

              <div className="h-full">
                {/* Account Details */}
                <AccountDetails 
                  userData={{
                    fullName: profile.fullName || displayName || "New Builder",
                    username: userHandle || "—",
                    email: emailAddress || "—",
                    major: profile.major || academicMajor || "—",
                    role: "Student Builder",
                    level: displayLevel,
                    tier: highestRank,
                    joinedYear: 2026,
                  }} 
                />
              </div>
            </div>
          </main>
          )}
        </div>
      </div>

      {/* Modals */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialTab={authInitialTab} />
      <CardCustomizationModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        initialConfig={cardConfig}
        onSave={handleSaveCardConfig}
        userData={{
          fullName: profile.fullName || displayName || "New Builder",
          level: displayLevel,
          skillsCount: profile.skills.length,
          questsCount: displayQuestsCount,
          achievementsCount: displayAchievementsCount,
          badgesCount: displayBadgesCount,
          avatarUrl: avatarUrl || undefined,
          mainSkill: profile.skills[0]?.skillName,
        }}
      />
    </div>
  );
}