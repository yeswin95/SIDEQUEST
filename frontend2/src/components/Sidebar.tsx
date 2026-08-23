"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { communities, guilds } from "@/lib/communityData";
import {
  Home,
  Compass,
  Plus,
  ChevronDown,
  ChevronUp,
  User,
  Layers,
  Sparkles,
  Bookmark,
  ShieldCheck,
  Code2,
  Cpu,
  Palette,
  Terminal,
  Users2,
  Trophy,
  ClipboardList,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  onOpenCreateQuest?: () => void;
  selectedTag?: string;
  onSelectTag?: (tag: string) => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  onOpenCreateQuest,
  selectedTag = "All Feed",
  onSelectTag,
}: SidebarProps) {
  const pathname = usePathname();

  // Collapsible section states
  const [skillsExpanded, setSkillsExpanded] = useState(true);
  const [clubsExpanded, setClubsExpanded] = useState(true);
  const [activityExpanded, setActivityExpanded] = useState(true);

  const mainNav = [
    { label: "Home", href: "/", icon: Home },
    { label: "Skills", href: "/skills", icon: Compass },
    { label: "My Quests", href: "/my-quests", icon: ClipboardList },
    { label: "My Profile & Tree", href: "/profile", icon: User },
  ];
  // const ReactIcon = () => (
  //   <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
  //     <path d="M0 0h24v24H0z" fill="none" />
  //     <path
  //       fill="currentColor"
  //       fillRule="evenodd"
  //       d="M18.38 8.305c2.79.86 4.62 2.24 4.62 3.7v.01c0 1.45-1.82 2.83-4.6 3.69c.65 2.84.37 5.1-.89 5.83c-.29.17-.63.25-1.01.25c-1.23 0-2.85-.87-4.48-2.39c-1.63 1.52-3.25 2.4-4.48 2.4c-.38 0-.72-.08-1.01-.25c-1.27-.73-1.56-3-.91-5.85c-2.79-.86-4.62-2.25-4.62-3.7s1.82-2.83 4.61-3.69c-.65-2.84-.37-5.1.89-5.83c.29-.17.63-.25 1.01-.25c1.23 0 2.85.86 4.48 2.38c1.64-1.53 3.25-2.4 4.48-2.4c.37 0 .71.08 1 .25c1.27.73 1.56 3 .91 5.85m-1.4-4.97a1 1 0 0 0-.51-.12h-.01c-.93 0-2.3.74-3.76 2.1c.64.66 1.26 1.41 1.87 2.24c1.01.11 1.97.27 2.85.49c.1-.45.18-.9.23-1.32c.2-1.71-.06-3.04-.67-3.39m-8.3 12.02c-.22-.34-.44-.69-.65-1.05l.01.01c-.21-.36-.41-.72-.59-1.08c-.24.6-.44 1.19-.61 1.77c.59.14 1.2.26 1.84.35m-.01-6.69c-.64.09-1.26.21-1.85.35v.01c.17.58.38 1.18.62 1.78c.18-.36.37-.72.58-1.08s.43-.71.65-1.06m.22 1.56c-.34.59-.65 1.19-.93 1.79c.28.6.59 1.19.93 1.78c.35.6.72 1.17 1.09 1.7a22.6 22.6 0 0 0 4.05 0q.555-.795 1.08-1.71c.34-.59.65-1.19.93-1.79c-.28-.6-.59-1.19-.93-1.78c-.35-.6-.72-1.17-1.09-1.7a22.6 22.6 0 0 0-4.05 0q-.555.795-1.08 1.71m7.66 2.98c-.18.36-.37.72-.58 1.08s-.43.71-.65 1.06c.64-.1 1.26-.22 1.85-.36a20 20 0 0 0-.62-1.78m-1.23-4.55c.22.34.44.69.65 1.05l-.01-.01c.21.36.41.72.59 1.08c.24-.6.44-1.19.61-1.77c-.59-.14-1.2-.26-1.84-.35M12 7.415c.41 0 .83.01 1.23.03c-.42-.52-.83-1-1.25-1.43c-.41.43-.83.91-1.23 1.43c.41-.03.84-.03 1.25-.03m-4.48-4.19c-.21 0-.39.04-.52.12h.01c-.6.36-.86 1.69-.65 3.4c.05.42.13.85.23 1.3c.88-.22 1.84-.38 2.85-.49c.59-.83 1.22-1.58 1.85-2.24c-1.47-1.35-2.84-2.09-3.77-2.09M5.86 14.732c-.436-.14-.863-.288-1.25-.457c-1.59-.68-2.61-1.57-2.61-2.27s1.03-1.6 2.61-2.27c.39-.17.81-.31 1.24-.45c.26.88.59 1.79 1.01 2.73c-.41.929-.74 1.838-1 2.717m1.16 5.953q.21.12.51.12c.94 0 2.31-.74 3.77-2.1c-.64-.66-1.26-1.41-1.87-2.24c-1.01-.11-1.97-.27-2.85-.49c-.1.45-.18.9-.23 1.32c-.2 1.71.06 3.04.67 3.39m3.74-4.12c.42.52.83 1 1.25 1.43c.41-.43.83-.91 1.23-1.43c-.41.03-.84.03-1.25.03s-.83-.01-1.23-.03m5.73 4.22c.21 0 .39-.04.52-.12H17c.6-.36.86-1.69.65-3.4c-.05-.41-.13-.85-.23-1.3c-.88.22-1.84.38-2.85.49c-.59.83-1.22 1.58-1.85 2.24c1.47 1.35 2.84 2.09 3.77 2.09m1.66-6.06c.43-.14.85-.28 1.24-.45c1.59-.67 2.62-1.57 2.62-2.27s-1.02-1.59-2.61-2.27c-.39-.17-.82-.32-1.26-.46c-.26.88-.59 1.79-1 2.72c.42.94.75 1.85 1.01 2.73m-4.1-2.72c0 1.13-.92 2.05-2.05 2.05s-2.05-.92-2.05-2.05s.92-2.05 2.05-2.05s2.05.92 2.05 2.05"
  //       clipRule="evenodd"
  //     />
  //   </svg>
  // );
  const skillGuilds = guilds.map((guild) => ({ ...guild, count: `${guild.quests} quests` }));

  const campusClubs = communities.map((community, index) => ({ ...community, icon: [Code2, Trophy, Cpu, Palette][index], color: ["text-[#3ecf8e]", "text-amber-400", "text-cyan-400", "text-purple-400"][index] }));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-14 bottom-0 left-0 z-40 w-64 border-r border-slate-200 bg-white/95 backdrop-blur-md overflow-y-auto transition-transform duration-200 ease-in-out dark:border-[#282828] dark:bg-[#121212]/95 lg:translate-x-0 ${isOpen ? "translate-x-0 shadow-2xl lg:shadow-none" : "-translate-x-full"
          }`}
      >
        <div className="flex flex-col gap-6 p-4 text-xs">
          {/* Primary Navigation List */}
          <div className="space-y-1">
            {mainNav.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/" && selectedTag === "All Feed"
                  : pathname === item.href;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => {
                    if (onClose) onClose();
                  }}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-all ${isActive
                    ? "bg-slate-100 text-slate-900 font-semibold dark:bg-[#232323] dark:text-[#ededed]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-[#1c1c1c] dark:hover:text-zinc-100"
                    }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-[#3ecf8e]" : "text-slate-400 dark:text-zinc-500"}`} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}

            {/* Start a quest CTA */}
            {onOpenCreateQuest && (
              <button
                type="button"
                onClick={() => {
                  onOpenCreateQuest();
                  if (onClose) onClose();
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-[#1c1c1c] dark:hover:text-zinc-100 transition-colors"
              >
                <Plus className="h-4 w-4 text-[#3ecf8e]" />
                <span>Start a quest / party</span>
              </button>
            )}
          </div>

          <hr className="border-slate-100 dark:border-[#282828]" />

          {/* Collapsible Section 1: Skill Tracks & Guilds */}
          <div>
            <button
              type="button"
              onClick={() => setSkillsExpanded(!skillsExpanded)}
              className="flex w-full items-center justify-between px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
            >
              <span>Skill Guilds</span>
              {skillsExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>

            {skillsExpanded && (
              <div className="mt-1.5 space-y-0.5">
                {/* Highlight Featured Card */}
                <div
                  onClick={() => { onSelectTag?.("Open Roles"); onClose?.(); }}
                  className="cursor-pointer mb-2 rounded-lg border border-[#3ecf8e]/30 bg-[#3ecf8e]/5 p-2.5 transition-all hover:border-[#3ecf8e] hover:bg-[#3ecf8e]/10 dark:bg-[#3ecf8e]/10"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#3ecf8e]">
                      HOT MATCH
                    </span>
                    <span className="rounded bg-[#3ecf8e] px-1.5 py-0.2 text-[9px] font-bold text-[#042f1a]">
                      NEW
                    </span>
                  </div>
                  <div className="mt-1 font-semibold text-slate-900 dark:text-[#ededed]">
                    Open Party Roles
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                    Filter quests with unfilled roster spots
                  </p>
                </div>

                {skillGuilds.map((guild) => {
                  const isSelected = pathname === `/guilds/${guild.slug}`;
                  return (
                    <Link
                      key={guild.name}
                      href={`/guilds/${guild.slug}`}
                      onClick={onClose}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors ${isSelected
                        ? "bg-[#3ecf8e]/10 text-[#3ecf8e] font-semibold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-[#1c1c1c] dark:hover:text-zinc-100"
                        }`}
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        <span className="text-sm">{guild.name
                        }</span>
                        <span className="truncate">{guild.name}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 shrink-0">
                        {guild.count}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <hr className="border-slate-100 dark:border-[#282828]" />

          {/* Collapsible Section 2: Campus Guilds & Communities */}
          <div>
            <button
              type="button"
              onClick={() => setClubsExpanded(!clubsExpanded)}
              className="flex w-full items-center justify-between px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
            >
              <span>Campus Guilds</span>
              {clubsExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>

            {clubsExpanded && (
              <div className="mt-1.5 space-y-0.5">
                {campusClubs.map((club) => {
                  const Icon = club.icon;
                  return (
                    <Link
                      key={club.name}
                      href={`/communities/${club.slug}`}
                      onClick={onClose}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-[#1c1c1c] dark:hover:text-zinc-100 transition-colors"
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${club.color}`} />
                      <span className="truncate">{club.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <hr className="border-slate-100 dark:border-[#282828]" />

          {/* Collapsible Section 3: My Activity & Quick Links */}
          <div>
            <button
              type="button"
              onClick={() => setActivityExpanded(!activityExpanded)}
              className="flex w-full items-center justify-between px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
            >
              <span>My Activity</span>
              {activityExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>

            {activityExpanded && (
              <div className="mt-1.5 space-y-0.5">
                <Link
                  href="/profile"
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-[#1c1c1c] dark:hover:text-zinc-100 transition-colors"
                >
                  <Layers className="h-4 w-4 text-[#3ecf8e]" />
                  <span>Skill Progression Tree</span>
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-[#1c1c1c] dark:hover:text-zinc-100 transition-colors"
                >
                  <ShieldCheck className="h-4 w-4 text-amber-400" />
                  <span>Verified Badges</span>
                </Link>
                <Link
                  href="/saved-quests"
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-[#1c1c1c] dark:hover:text-zinc-100 transition-colors"
                >
                  <Bookmark className="h-4 w-4 text-purple-400" />
                  <span>Saved Quests</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
