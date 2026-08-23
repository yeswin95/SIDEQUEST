"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import PlayerProfileCard, { PlayerSkill, ActiveStatus } from "@/components/PlayerProfileCard";
import CreateQuestModal from "@/components/CreateQuestModal";
import ConnectedHandles from "@/components/ConnectedHandles";
import BadgeGrid from "@/components/achievements/BadgeGrid";
import { mockAchievements, mockCampusBadges } from "@/lib/skillsData";
import { api, getStoredToken } from "@/lib/api";
import { User, Camera, Trash2, Edit2, CreditCard } from "lucide-react";
import MetalPlayerCard, { PlayerCardConfig } from "@/components/MetalPlayerCard";
import CardCustomizationModal from "@/components/CardCustomizationModal";
import AccountDetails from "@/components/AccountDetails";
import { getHighestTier, getTierTokens } from "@/lib/tierConfig";

const initialSkills: PlayerSkill[] = [
  { id: "1", skillName: "Java", category: "Backend", rankTier: "GOLD", verified: true },
  { id: "2", skillName: "Spring Boot", category: "Backend", rankTier: "PLATINUM", verified: true },
  { id: "3", skillName: "React", category: "Frontend", rankTier: "SILVER", verified: true },
  { id: "4", skillName: "PostgreSQL", category: "Data", rankTier: "GOLD" },
  { id: "5", skillName: "Docker", category: "DevOps", rankTier: "PLATINUM", verified: true },
  { id: "6", skillName: "Figma", category: "Design", rankTier: "BRONZE" },
];

export default function ProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeStatus, setActiveStatus] = useState<ActiveStatus>("OPEN_TO_JOIN");
  
  // Profile settings
  const [profile, setProfile] = useState({
    fullName: "Alex Rivera",
    major: "Computer Science",
    gradYear: 2027,
    bio: "Full stack developer & systems enthusiast. Always looking for innovative hackathon projects and campus collaborations.",
    skills: initialSkills,
  });

  // Profile Header States
  const [displayName, setDisplayName] = useState(profile.fullName);
  const [userHandle, setUserHandle] = useState("@alexrivera");
  const [emailAddress, setEmailAddress] = useState("alex.rivera@campus.edu");
  const [academicMajor, setAcademicMajor] = useState(profile.major);
  const [graduationYear, setGraduationYear] = useState(profile.gradYear);
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

  // Initial loads
  useEffect(() => {
    // Fetch API user details
    api.profiles.getMe()
      .then((res) => {
        if (res) {
          const mappedName = res.fullName || profile.fullName;
          const mappedMajor = res.major || profile.major;
          const mappedYear = res.collegeYear ? 2024 + res.collegeYear : profile.gradYear;
          const mappedSkills = res.skills && res.skills.length > 0 
            ? res.skills.map((s: any) => ({
                id: s.id || s.skillId || Math.random().toString(),
                skillName: s.skillName,
                category: s.category,
                rankTier: s.rankTier,
                verified: s.verificationStatus === "VERIFIED",
              })) 
            : profile.skills;

          setProfile((prev) => ({
            ...prev,
            fullName: mappedName,
            major: mappedMajor,
            gradYear: mappedYear,
            skills: mappedSkills,
          }));

          const mappedStatus: ActiveStatus = res.activeStatus === "ACTIVE" 
            ? "OPEN_TO_JOIN" 
            : res.activeStatus === "INACTIVE" 
            ? "OFFLINE" 
            : "OPEN_TO_JOIN";
          setActiveStatus(mappedStatus);

          if (!localStorage.getItem("sidequest_username")) setDisplayName(mappedName);
          if (!localStorage.getItem("sidequest_major")) setAcademicMajor(mappedMajor);
          if (!localStorage.getItem("sidequest_grad_year")) setGraduationYear(mappedYear);
        }
      })
      .catch(() => {});
  }, []);

  // Sync state from LocalStorage on component mount & updates
  useEffect(() => {
    const loadLocalStorage = () => {
      const storedAvatar = localStorage.getItem("sidequest_avatar");
      setAvatarUrl(storedAvatar);

      const DEFAULT_BIO = "Full stack developer & systems enthusiast. Always looking for innovative hackathon projects and campus collaborations.";
      const storedBio = localStorage.getItem("sidequest_bio");
      const activeBio = storedBio !== null ? storedBio : DEFAULT_BIO;
      setBio(activeBio);
      setProfile((prev) => ({ ...prev, bio: activeBio }));

      const storedName = localStorage.getItem("sidequest_username");
      if (storedName) {
        setDisplayName(storedName);
        setProfile((prev) => ({ ...prev, fullName: storedName }));
      }
      
      const storedHandle = localStorage.getItem("sidequest_user_handle");
      if (storedHandle) setUserHandle(storedHandle);

      const storedEmail = localStorage.getItem("sidequest_email");
      if (storedEmail) setEmailAddress(storedEmail);

      const storedMajor = localStorage.getItem("sidequest_major");
      if (storedMajor) {
        setAcademicMajor(storedMajor);
        setProfile((prev) => ({ ...prev, major: storedMajor }));
      }

      const storedGradYear = localStorage.getItem("sidequest_grad_year");
      if (storedGradYear) {
        setGraduationYear(Number(storedGradYear));
        setProfile((prev) => ({ ...prev, gradYear: Number(storedGradYear) }));
      }

      const storedConfig = localStorage.getItem("sidequest_card_config");
      if (storedConfig) {
        try {
          setCardConfig(JSON.parse(storedConfig));
        } catch (e) {}
      } else {
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
  }, [profile.skills]);

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
    localStorage.setItem("sidequest_grad_year", String(graduationYear));
    localStorage.setItem("sidequest_bio", trimmedBio);

    setBio(trimmedBio);
    setProfile((prev) => ({
      ...prev,
      fullName: displayName,
      major: academicMajor,
      gradYear: Number(graduationYear),
      bio: trimmedBio,
    }));

    if (getStoredToken()) {
      const yearOffset = Number(graduationYear) - 2024;
      const statusMapping = activeStatus === "OPEN_TO_JOIN" ? "ACTIVE" : activeStatus === "OFFLINE" ? "INACTIVE" : "ACTIVE";

      api.profiles.updateMe({
        fullName: displayName,
        collegeYear: yearOffset > 0 ? yearOffset : 3,
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

  const highestRank = getHighestTier(profile.skills.map((s) => s.rankTier));
  const highestTokens = getTierTokens(highestRank);

  const getInitials = (name: string) => {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("");
  };

  // Filter list computed values
  const [selectedRarity] = useState<string>("all"); // Keep for backward compatibility or metadata references if needed, although mostly unused now

  const filteredAchievements = useMemo(() => {
    if (selectedStatus === "all") return mockAchievements;
    return mockAchievements.filter((badge) => badge.status === selectedStatus);
  }, [selectedStatus]);

  const filteredCampusBadges = useMemo(() => {
    if (selectedStatus === "all") return mockCampusBadges;
    return mockCampusBadges.filter((badge) => badge.status === selectedStatus);
  }, [selectedStatus]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-[#121212] dark:text-[#ededed] flex flex-col">
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onOpenCreateQuest={() => setIsCreateModalOpen(true)}
      />

      <div className="flex-1 flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpenCreateQuest={() => setIsCreateModalOpen(true)}
        />

        <div className="flex-1 lg:pl-64 flex justify-center">
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
                    Level 12 &middot; <span className="font-semibold" style={{ color: highestTokens.dot }}>{highestRank} Rank</span>
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
                              onClick={() => {
                                setActiveStatus(st);
                                setIsStatusDropdownOpen(false);
                              }}
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
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#3ecf8e] dark:border-[#282828] dark:bg-[#1c1c1c] dark:text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1">Username Handle</label>
                    <input
                      type="text"
                      value={userHandle}
                      onChange={(e) => setUserHandle(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#3ecf8e] dark:border-[#282828] dark:bg-[#1c1c1c] dark:text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#3ecf8e] dark:border-[#282828] dark:bg-[#1c1c1c] dark:text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1">Academic Focus / Major</label>
                    <input
                      type="text"
                      value={academicMajor}
                      onChange={(e) => setAcademicMajor(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#3ecf8e] dark:border-[#282828] dark:bg-[#1c1c1c] dark:text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1">Graduation Year</label>
                    <input
                      type="number"
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#3ecf8e] dark:border-[#282828] dark:bg-[#1c1c1c] dark:text-zinc-100"
                    />
                  </div>

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
                        fullName: profile.fullName,
                        level: 12,
                        skillsCount: profile.skills.length,
                        questsCount: 27,
                        achievementsCount: mockAchievements.length,
                        badgesCount: mockCampusBadges.length,
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
                  gradYear={profile.gradYear}
                  activeStatus={activeStatus}
                  skills={profile.skills}
                  bio={profile.bio}
                  avatarUrl={avatarUrl}
                  className="h-full flex flex-col justify-between"
                />
              </div>
            </div>

            {/* Achievements & Campus Badges */}
            <div className="mt-10">
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
                    <BadgeGrid badges={filteredAchievements} unfilteredBadges={mockAchievements} />
                  </div>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#282828] dark:bg-[#1c1c1c] h-full flex flex-col">
                  <h3 className="text-lg font-semibold leading-none mb-6 text-slate-900 dark:text-[#ededed]">
                    Campus Badges
                  </h3>
                  <div className="flex-1">
                    <BadgeGrid badges={filteredCampusBadges} unfilteredBadges={mockCampusBadges} />
                  </div>
                </section>
              </div>
            </div>

            {/* Remaining Profile Sections */}
            <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              <div className="flex flex-col justify-between h-full">
                {/* Connected Handles */}
                <ConnectedHandles className="w-full" />
              </div>

              <div className="h-full">
                {/* Account Details */}
                <AccountDetails 
                  userData={{
                    fullName: profile.fullName,
                    username: userHandle,
                    email: emailAddress,
                    major: profile.major,
                    gradYear: profile.gradYear,
                    role: "Student Builder",
                    level: 12,
                    tier: highestRank,
                    joinedYear: 2026,
                  }} 
                />
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Modals */}
      <CreateQuestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onQuestCreated={() => {}}
      />

      <CardCustomizationModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        initialConfig={cardConfig}
        onSave={handleSaveCardConfig}
        userData={{
          fullName: profile.fullName,
          level: 12,
          skillsCount: profile.skills.length,
          questsCount: 27,
          achievementsCount: mockAchievements.length,
          badgesCount: mockCampusBadges.length,
          avatarUrl: avatarUrl || undefined,
          mainSkill: profile.skills[0]?.skillName,
        }}
      />
    </div>
  );
}