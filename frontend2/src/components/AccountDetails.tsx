"use client";

import { Info, User, Mail, GraduationCap, Shield, Calendar } from "lucide-react";

interface AccountDetailsProps {
  userData: {
    fullName: string;
    username: string;
    email: string;
    major: string;
    gradYear: number;
    role: string;
    level: number;
    tier: string;
    joinedYear: number;
  };
}

export default function AccountDetails({ userData }: AccountDetailsProps) {
  return (
    <div id="account-details" className="scroll-mt-20 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#282828] dark:bg-[#1c1c1c] dark:shadow-none">
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-[#282828] pb-3 mb-4">
        <Info className="h-4 w-4 text-[#3ecf8e]" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-[#ededed]">Account & Profile Details</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-50 bg-slate-50/50 dark:border-[#282828] dark:bg-[#161616]">
          <User className="h-4 w-4 text-slate-400 dark:text-zinc-500 shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">Full Name</span>
            <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate block">{userData.fullName}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-50 bg-slate-50/50 dark:border-[#282828] dark:bg-[#161616]">
          <User className="h-4 w-4 text-slate-400 dark:text-zinc-500 shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">Username</span>
            <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate block">{userData.username}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-50 bg-slate-50/50 dark:border-[#282828] dark:bg-[#161616]">
          <Mail className="h-4 w-4 text-slate-400 dark:text-zinc-500 shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">Email Address</span>
            <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate block">{userData.email}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-50 bg-slate-50/50 dark:border-[#282828] dark:bg-[#161616]">
          <GraduationCap className="h-4 w-4 text-slate-400 dark:text-zinc-500 shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">Academic Focus</span>
            <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate block">
              {userData.major} &middot; Class of {userData.gradYear}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-50 bg-slate-50/50 dark:border-[#282828] dark:bg-[#161616]">
          <Shield className="h-4 w-4 text-slate-400 dark:text-zinc-500 shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">Rank & Level Status</span>
            <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate block">
              Level {userData.level} ({userData.tier}) &middot; {userData.role}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-50 bg-slate-50/50 dark:border-[#282828] dark:bg-[#161616]">
          <Calendar className="h-4 w-4 text-slate-400 dark:text-zinc-500 shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">Member Since</span>
            <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate block">Year {userData.joinedYear}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
