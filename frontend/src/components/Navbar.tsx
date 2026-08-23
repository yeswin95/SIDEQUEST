"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Swords,
  Menu,
  Search,
  Plus,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import ProfileMenu from "@/components/ProfileMenu";
import AuthModal from "@/components/AuthModal";
import { getStoredToken } from "@/lib/api";

interface NavbarProps {
  onToggleSidebar?: () => void;
  onOpenCreateQuest?: () => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}

export default function Navbar({
  onToggleSidebar,
  onOpenCreateQuest,
  searchQuery = "",
  onSearchChange,
}: NavbarProps) {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [name, setName] = useState("Alex");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const loadData = () => {
      const storedAvatar = localStorage.getItem("sidequest_avatar");
      setAvatarUrl(storedAvatar);
      const storedName = localStorage.getItem("sidequest_username") || "Alex";
      setName(storedName.split(" ")[0]);
      setIsAuthenticated(!!getStoredToken());
    };
    loadData();
    window.addEventListener("storage", loadData);
    window.addEventListener("sidequest_avatar_changed", loadData);
    window.addEventListener("sidequest_auth_changed", loadData);
    return () => {
      window.removeEventListener("storage", loadData);
      window.removeEventListener("sidequest_avatar_changed", loadData);
      window.removeEventListener("sidequest_auth_changed", loadData);
    };
  }, []);

  return (
    <nav className="sticky top-0 z-50 h-14 border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-[#282828] dark:bg-[#121212]/95">
      <div className="flex h-full items-center justify-between px-4 sm:px-6 gap-4">
        {/* Left: Sidebar Toggle Button + Swords Logo */}
        <div className="flex items-center gap-3 shrink-0">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              aria-label="Toggle sidebar"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-[#232323] dark:hover:text-zinc-100 transition-colors"
            >
              <Menu className="h-4 w-4" />
            </button>
          )}

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#3ecf8e]/40 bg-[#3ecf8e]/10 text-[#3ecf8e] group-hover:border-[#3ecf8e] group-hover:shadow-[0_0_12px_rgba(62,207,142,0.25)] transition-all">
              <Swords className="h-4 w-4" />
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-bold tracking-wider text-slate-900 dark:text-[#ededed] uppercase">
                SIDEQUEST <span className="text-[#3ecf8e] font-extrabold">HUD</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-lg hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder="Search quests, skills, hackathon teams, or leaders..."
              className="w-full rounded-full border border-slate-200 bg-slate-50/80 pl-9 pr-4 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#3ecf8e] focus:bg-white focus:outline-none dark:border-[#282828] dark:bg-[#1c1c1c] dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:bg-[#202020] transition-colors"
            />
          </div>
        </div>

        {/* Right: Post Quest CTA + Profile Shortcut + Theme Toggle */}
        <div className="flex items-center gap-2.5 shrink-0">
          {onOpenCreateQuest && (
            <button
              type="button"
              onClick={onOpenCreateQuest}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#3ecf8e] px-3.5 py-1.5 text-xs font-semibold text-[#042f1a] shadow-sm transition-all hover:bg-[#34b27b]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Post Quest</span>
            </button>
          )}

          {/* Profile Shortcut Avatar or Sign In button */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center gap-2 rounded-full border p-1 transition-all ${
                  pathname === "/profile" || dropdownOpen
                    ? "border-[#3ecf8e] bg-[#3ecf8e]/10 text-[#3ecf8e]"
                    : "border-slate-200 bg-slate-50 hover:border-slate-300 dark:border-[#282828] dark:bg-[#1c1c1c] dark:hover:border-[#383838]"
                }`}
                title="Profile Menu"
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="Avatar" className="h-6 w-6 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3ecf8e]/20 text-[10px] font-bold text-[#3ecf8e] shrink-0">
                    {name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <span className="hidden md:inline text-xs font-medium text-slate-700 dark:text-zinc-300 pr-1.5">
                  {name}
                </span>
              </button>

              {dropdownOpen && (
                <ProfileMenu 
                  onClose={() => setDropdownOpen(false)} 
                  onCustomizeCard={() => {
                    setDropdownOpen(false);
                    if (window.location.pathname === "/profile") {
                      window.dispatchEvent(new CustomEvent("sidequest_open_card_customizer"));
                    } else {
                      window.location.href = "/profile?customize=true";
                    }
                  }}
                />
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 px-3.5 py-1.5 text-xs font-bold text-white transition-all dark:bg-[#161616] dark:border-[#282828] dark:text-zinc-300 dark:hover:border-[#383838]"
            >
              Sign In
            </button>
          )}

          <div className="h-4 w-px bg-slate-200 dark:bg-[#282828]" />

          {/* Theme Toggle Button */}
          <div title="Toggle Light / Dark Mode">
            <ThemeToggle />
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </nav>
  );
}
