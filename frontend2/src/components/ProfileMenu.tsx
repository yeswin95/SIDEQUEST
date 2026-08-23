"use client";

import Link from "next/link";
import { User, CreditCard, Sliders, LogOut, Info } from "lucide-react";
import { removeStoredToken } from "@/lib/api";
import { useEffect, useState } from "react";

interface ProfileMenuProps {
  onClose: () => void;
  onCustomizeCard: () => void;
}

export default function ProfileMenu({ onClose, onCustomizeCard }: ProfileMenuProps) {
  const [name, setName] = useState("Alex Rivera");

  useEffect(() => {
    // Dynamically retrieve username if stored locally
    const storedName = localStorage.getItem("sidequest_username");
    if (storedName) setName(storedName);
  }, []);

  const handleLogout = () => {
    removeStoredToken();
    localStorage.removeItem("sidequest_username");
    localStorage.removeItem("sidequest_user_handle");
    localStorage.removeItem("sidequest_email");
    localStorage.removeItem("sidequest_major");
    localStorage.removeItem("sidequest_grad_year");
    localStorage.removeItem("sidequest_avatar");
    localStorage.removeItem("sidequest_card_config");
    window.location.reload();
  };

  return (
    <div 
      className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-[#282828] dark:bg-[#1c1c1c] animate-in fade-in slide-in-from-top-2 duration-150"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-3 py-2 border-b border-slate-100 dark:border-[#282828] mb-1">
        <p className="text-xs font-semibold text-slate-900 dark:text-[#ededed] truncate">{name}</p>
        <p className="text-[10px] text-slate-500 dark:text-zinc-400">Computer Science &middot; Lv. 12</p>
      </div>

      <div className="space-y-0.5">
        <Link
          href="/profile"
          onClick={onClose}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:text-zinc-300 dark:hover:bg-[#232323] dark:hover:text-zinc-100"
        >
          <User className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
          <span>Profile Page</span>
        </Link>

        <a
          href="/profile#account-details"
          onClick={() => {
            onClose();
            const el = document.getElementById("account-details");
            if (el) {
              el.scrollIntoView({ behavior: "smooth" });
            } else {
              window.location.href = "/profile#account-details";
            }
          }}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:text-zinc-300 dark:hover:bg-[#232323] dark:hover:text-zinc-100"
        >
          <Info className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
          <span>Account Details</span>
        </a>

        <button
          type="button"
          onClick={() => {
            onClose();
            onCustomizeCard();
          }}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:text-zinc-300 dark:hover:bg-[#232323] dark:hover:text-zinc-100"
        >
          <CreditCard className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
          <span>Customize Card</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:text-zinc-300 dark:hover:bg-[#232323] dark:hover:text-zinc-100"
        >
          <Sliders className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
          <span>Settings</span>
        </button>

        <hr className="my-1 border-slate-100 dark:border-[#282828]" />

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
