"use client";

import { useState } from "react";
import { getSavedQuestIds, setQuestSaved } from "@/lib/savedQuests";
import {
  Clock,
  Users,
  Share2,
  Bookmark,
  ExternalLink,
  MessageSquare,
  ArrowBigUp,
  ArrowBigDown,
  Repeat,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export interface PartyRole {
  id: string;
  roleTitle: string;
  filled: number;
  total: number;
}

export interface QuestCardProps {
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
  initialUpvotes?: number;
  commentsCount?: number;
  onJoin?: () => void;
  joinDisabled?: boolean;
  joinLabel?: string;
  isSaved?: boolean;
  onSavedChange?: (id: string, saved: boolean) => void;
}

function timeAgo(dateString: string): string {
  const posted = new Date(dateString).getTime();
  if (Number.isNaN(posted)) return dateString;
  const diffMs = Date.now() - posted;
  const mins = Math.floor(diffMs / (1000 * 60));
  if (mins < 60) return `${mins <= 1 ? "just now" : `${mins}m ago`}`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "1d ago";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export default function QuestCard({
  id,
  title,
  description,
  ownerName,
  ownerAvatarUrl,
  ownerRole = "Party Leader",
  guildTag = "CampusBuilds",
  datePosted,
  requiredSkills,
  roles,
  repoLink,
  initialUpvotes = 24,
  commentsCount = 3,
  onJoin,
  joinDisabled = false,
  joinLabel = "Apply to Join",
  isSaved,
  onSavedChange,
}: QuestCardProps) {
  const [upvoted, setUpvoted] = useState<boolean | null>(null);
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [bookmarked, setBookmarked] = useState(() => isSaved ?? getSavedQuestIds().includes(id));
  const [copied, setCopied] = useState(false);

  const totalSpots = roles.reduce((acc, r) => acc + r.total, 0);
  const filledSpots = roles.reduce((acc, r) => acc + r.filled, 0);
  const isFull = totalSpots > 0 && filledSpots >= totalSpots;

  const handleVote = (type: "up" | "down") => {
    if (type === "up") {
      if (upvoted === true) {
        setUpvoted(null);
        setUpvotes((v) => v - 1);
      } else {
        setUpvotes((v) => (upvoted === false ? v + 2 : v + 1));
        setUpvoted(true);
      }
    } else {
      if (upvoted === false) {
        setUpvoted(null);
        setUpvotes((v) => v + 1);
      } else {
        setUpvotes((v) => (upvoted === true ? v - 2 : v - 1));
        setUpvoted(false);
      }
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const toggleSaved = () => {
    const next = !bookmarked;
    setBookmarked(next);
    setQuestSaved({ id, title, description, ownerName, ownerRole, guildTag, datePosted, requiredSkills, roles, repoLink, upvotes, commentsCount }, next);
    onSavedChange?.(id, next);
  };

  return (
    <article id={`quest-${id}`} className="group rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm transition-all duration-200 hover:border-slate-300 dark:border-[#282828] dark:bg-[#1c1c1c] dark:shadow-none dark:hover:border-[#383838] dark:hover:bg-[#1f1f1f]">
      {/* Post Header: Guild Tag + Author + TimeAgo */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {ownerAvatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={ownerAvatarUrl}
              alt={ownerName}
              className="h-9 w-9 rounded-full object-cover ring-2 ring-slate-100 dark:ring-[#282828]"
            />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700 ring-2 ring-[#3ecf8e]/20 dark:bg-[#262626] dark:text-zinc-200">
              {initials(ownerName)}
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="rounded bg-[#3ecf8e]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#3ecf8e]">
                g/{guildTag}
              </span>
              <span className="text-slate-300 dark:text-zinc-700">&middot;</span>
              <span className="truncate text-xs font-semibold text-slate-900 dark:text-[#ededed]">
                {ownerName}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                ({ownerRole})
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-zinc-500">
              <Clock className="h-3 w-3" />
              <span>{timeAgo(datePosted)}</span>
            </div>
          </div>
        </div>

        {/* Save / Bookmark Button */}
        <button
          type="button"
          onClick={toggleSaved}
          aria-label="Save quest"
          className={`rounded-lg p-1.5 transition-colors ${
            bookmarked
              ? "text-[#3ecf8e] bg-[#3ecf8e]/10"
              : "text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-zinc-500 dark:hover:bg-[#282828] dark:hover:text-zinc-300"
          }`}
        >
          <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* Quest Title & Description */}
      <div className="mt-3">
        <h2 className="text-base font-semibold text-slate-900 transition-colors group-hover:text-[#3ecf8e] dark:text-[#ededed] dark:group-hover:text-[#3ecf8e]">
          {title}
        </h2>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-zinc-400">
          {description}
        </p>
      </div>

      {/* Required Skills Tags */}
      {requiredSkills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {requiredSkills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:border-[#282828] dark:bg-[#232323] dark:text-zinc-300"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Open Roles & Spot Meters */}
      {roles.length > 0 && (
        <div className="mt-3.5 rounded-lg border border-slate-100 bg-slate-50/60 p-3 dark:border-[#282828] dark:bg-[#161616]">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-1.5 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
              Party Roster ({filledSpots}/{totalSpots} spots)
            </span>
            <span className={isFull ? "text-amber-500 font-semibold" : "text-[#3ecf8e] font-semibold"}>
              {isFull ? "Party Full" : `${totalSpots - filledSpots} open spots`}
            </span>
          </div>

          <div className="space-y-2">
            {roles.map((role) => {
              const pct = role.total === 0 ? 0 : Math.min(100, (role.filled / role.total) * 100);
              const roleFull = role.filled >= role.total;

              return (
                <div key={role.id} className="flex min-w-0 items-center gap-2.5">
                  <span className="w-24 shrink-0 break-words text-xs text-slate-700 dark:text-zinc-300 font-medium sm:w-28">
                    {role.roleTitle}
                  </span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-[#282828]">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        roleFull ? "bg-amber-400" : "bg-[#3ecf8e]"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right text-[11px] font-mono tabular-nums text-slate-500 dark:text-zinc-500">
                    {role.filled}/{role.total}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reddit-Style Bottom Action Bar */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-[#282828]">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Upvote Pill */}
          <div className="flex items-center rounded-full bg-slate-100 p-0.5 dark:bg-[#232323]">
            <button
              type="button"
              onClick={() => handleVote("up")}
              aria-label="Upvote quest"
              className={`rounded-full p-1 transition-colors ${
                upvoted === true
                  ? "text-[#3ecf8e] bg-[#3ecf8e]/20"
                  : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              <ArrowBigUp className="h-4 w-4" />
            </button>
            <span className={`px-1 text-xs font-semibold tabular-nums ${
              upvoted === true ? "text-[#3ecf8e]" : upvoted === false ? "text-rose-500" : "text-slate-700 dark:text-zinc-300"
            }`}>
              {upvotes}
            </span>
            <button
              type="button"
              onClick={() => handleVote("down")}
              aria-label="Downvote quest"
              className={`rounded-full p-1 transition-colors ${
                upvoted === false
                  ? "text-rose-500 bg-rose-500/20"
                  : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              <ArrowBigDown className="h-4 w-4" />
            </button>
          </div>

          {/* Comments Count Pill */}
          <button
            type="button"
            onClick={onJoin}
            className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200/80 dark:bg-[#232323] dark:text-zinc-400 dark:hover:bg-[#2c2c2c] dark:hover:text-zinc-200 transition-colors"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{commentsCount}</span>
          </button>

          {/* Share Pill */}
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200/80 dark:bg-[#232323] dark:text-zinc-400 dark:hover:bg-[#2c2c2c] dark:hover:text-zinc-200 transition-colors"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{copied ? "Copied!" : "Share"}</span>
          </button>
        </div>

        {/* Apply CTA Button */}
        <button
          type="button"
          onClick={onJoin}
          disabled={joinDisabled || isFull}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#3ecf8e] px-4 py-1.5 text-xs font-semibold text-[#042f1a] shadow-sm transition-all hover:bg-[#34b27b] hover:shadow disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 dark:disabled:bg-[#282828] dark:disabled:text-zinc-600"
        >
          {joinLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </article>
  );
}
