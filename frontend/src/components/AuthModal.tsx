"use client";

import React, { useState } from "react";
import { X, Mail, Lock, User, GraduationCap, Award, AlertCircle, Loader2 } from "lucide-react";
import { api, setStoredToken } from "@/lib/api";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectTo?: string;
  initialTab?: "signin" | "signup";
}

export default function AuthModal({ isOpen, onClose, redirectTo, initialTab }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">(initialTab || "signin");

  // Sync tab when modal opens with a requested initialTab (Login vs Register CTA)
  React.useEffect(() => {
    if (isOpen && initialTab) setActiveTab(initialTab);
  }, [isOpen, initialTab]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [major, setMajor] = useState("");
  const [collegeYear, setCollegeYear] = useState<number>(3); // Default Junior (3)

  const passwordsMismatch = activeTab === "signup" && confirmPassword.length > 0 && password !== confirmPassword;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (activeTab === "signin") {
        if (!email.trim() || !password) {
          throw new Error("Please enter both email and password.");
        }
        const res = await api.auth.login({ email: email.trim(), password });
        if (res && res.accessToken) {
          setStoredToken(res.accessToken);
          localStorage.setItem("sidequest_username", res.fullName);
          localStorage.setItem("sidequest_email", res.email);
          
          // Trigger global auth refresh
          window.dispatchEvent(new CustomEvent("sidequest_auth_changed"));
          window.dispatchEvent(new CustomEvent("sidequest_avatar_changed"));
          
          if (redirectTo) {
            window.location.href = redirectTo;
          } else {
            onClose();
          }
        } else {
          throw new Error("Failed to retrieve access token from backend.");
        }
      } else {
        if (!username.trim() || !email.trim() || !password || !confirmPassword || !fullName.trim() || !major.trim()) {
          throw new Error("All fields are required for sign up.");
        }
        if (username.trim().length < 3 || username.trim().length > 30) {
          throw new Error("Username must be between 3 and 30 characters.");
        }
        if (password.length < 8) {
          throw new Error("Password must be at least 8 characters long.");
        }
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        const res = await api.auth.register({
          username: username.trim(),
          email: email.trim(),
          password,
          fullName: fullName.trim(),
          major: major.trim(),
          collegeYear,
        });
        if (res && res.accessToken) {
          setStoredToken(res.accessToken);
          localStorage.setItem("sidequest_username", res.fullName);
          localStorage.setItem("sidequest_user_handle", res.username || username.trim());
          localStorage.setItem("sidequest_email", res.email);
          localStorage.setItem("sidequest_major", major.trim());
          localStorage.setItem("sidequest_grad_year", String(2024 + collegeYear));
          // Fresh user: zeroed-out dashboard - clear any previous user's local state
          // Set connected handles to "Not Connected" by default
          try {
            localStorage.removeItem("sidequest_completed_skill_ids");
            localStorage.removeItem("sidequest_next_goals");
            localStorage.removeItem("sidequest_avatar");
            localStorage.removeItem("sidequest_bio");
            localStorage.removeItem("sidequest_card_config");
            localStorage.setItem("sidequest_connected_handles", JSON.stringify([
              { label: "github.com/alexrivera", href: "https://github.com", icon: "github", status: "Not Connected" },
              { label: "linkedin.com/in/alexrivera", href: "https://linkedin.com", icon: "linkedin", status: "Not Connected" },
              { label: "leetcode.com/alexrivera", href: "https://leetcode.com", icon: "leetcode", status: "Not Connected" },
              { label: "codechef.com/users/alexrivera", href: "https://codechef.com", icon: "codechef", status: "Not Connected" },
              { label: "alexrivera.dev", href: "https://alexrivera.dev", icon: "portfolio", status: "Not Connected" },
            ]));
          } catch {}

          // Trigger global auth refresh
          window.dispatchEvent(new CustomEvent("sidequest_auth_changed"));
          window.dispatchEvent(new CustomEvent("sidequest_avatar_changed"));
          
          if (redirectTo) {
            window.location.href = redirectTo;
          } else {
            onClose();
          }
        } else {
          throw new Error("Failed to register and log in.");
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setErrorMsg(err.message || "An authentication error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto overflow-x-hidden">
      {/* Backdrop - dim only, highest layer to cover feed */}
      <div
        className="fixed inset-0 z-[9998] bg-slate-900/60 dark:bg-black/70 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Auth Card - centered in viewport, scrollable if tall */}
      <div className="relative z-[9999] w-full max-w-sm m-auto max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-[#282828] dark:bg-[#1a1a1a] animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700 dark:text-zinc-500 dark:hover:bg-[#232323] dark:hover:text-zinc-300 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Tab Headers */}
        <div className="flex border-b border-slate-100 dark:border-[#282828] mb-5">
          <button
            type="button"
            onClick={() => {
              setActiveTab("signin");
              setErrorMsg(null);
            }}
            className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === "signin"
                ? "border-[#3ecf8e] text-[#3ecf8e]"
                : "border-transparent text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-400"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("signup");
              setErrorMsg(null);
            }}
            className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === "signup"
                ? "border-[#3ecf8e] text-[#3ecf8e]"
                : "border-transparent text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-400"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Title / Description */}
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-[#ededed]">
            {activeTab === "signin" ? "Welcome Back, Student Builder" : "Join the SIDEQUEST Guild"}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
            {activeTab === "signin"
              ? "Sign in to synchronize your verified skill matrix and active party quests."
              : "Register to verify credentials, join quest parties, and design your collectible builder card."}
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMsg && (
          <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600 dark:border-red-950/40 dark:bg-red-950/20 dark:text-red-400 animate-in fade-in duration-150">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Sign Up Fields */}
          {activeTab === "signup" && (
            <>
              {/* Username */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1 block">
                  Username <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="alexrivera"
                    minLength={3}
                    maxLength={30}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-900 focus:border-[#3ecf8e] focus:bg-white focus:outline-none dark:border-[#282828] dark:bg-[#161616] dark:text-zinc-100 dark:focus:bg-[#202020] transition-colors"
                  />
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1 block">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-900 focus:border-[#3ecf8e] focus:bg-white focus:outline-none dark:border-[#282828] dark:bg-[#161616] dark:text-zinc-100 dark:focus:bg-[#202020] transition-colors"
                  />
                </div>
              </div>

              {/* Major */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1 block">
                  Major
                </label>
                <div className="relative">
                  <Award className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    placeholder="Computer Science"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-900 focus:border-[#3ecf8e] focus:bg-white focus:outline-none dark:border-[#282828] dark:bg-[#161616] dark:text-zinc-100 dark:focus:bg-[#202020] transition-colors"
                  />
                </div>
              </div>

              {/* College Year */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1 block">
                  College Year
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-zinc-500" />
                  <select
                    value={collegeYear}
                    onChange={(e) => setCollegeYear(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-900 focus:border-[#3ecf8e] focus:bg-white focus:outline-none dark:border-[#282828] dark:bg-[#161616] dark:text-zinc-100 dark:focus:bg-[#202020] transition-colors appearance-none"
                  >
                    <option value={1}>Freshman (Year 1)</option>
                    <option value={2}>Sophomore (Year 2)</option>
                    <option value={3}>Junior (Year 3)</option>
                    <option value={4}>Senior (Year 4)</option>
                    <option value={5}>Grad Student (Year 5)</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1 block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex.rivera@campus.edu"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-900 focus:border-[#3ecf8e] focus:bg-white focus:outline-none dark:border-[#282828] dark:bg-[#161616] dark:text-zinc-100 dark:focus:bg-[#202020] transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1 block">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full rounded-lg border bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none dark:bg-[#161616] dark:text-zinc-100 dark:focus:bg-[#202020] transition-colors ${activeTab === "signup" && password && password.length < 8 ? "border-amber-300 focus:border-amber-400" : "border-slate-200 focus:border-[#3ecf8e] dark:border-[#282828]"}`}
              />
            </div>
            {activeTab === "signup" && password && password.length > 0 && password.length < 8 && (
              <p className="mt-1 text-[10px] text-amber-600 dark:text-amber-400">Password must be at least 8 characters</p>
            )}
          </div>

          {/* Confirm Password - signup only */}
          {activeTab === "signup" && (
            <div>
              <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1 block">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-zinc-500" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full rounded-lg border bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none dark:bg-[#161616] dark:text-zinc-100 dark:focus:bg-[#202020] transition-colors ${passwordsMismatch ? "border-red-300 focus:border-red-400 dark:border-red-800" : "border-slate-200 focus:border-[#3ecf8e] dark:border-[#282828]"}`}
                />
              </div>
              {passwordsMismatch && (
                <p className="mt-1 text-[10px] font-medium text-red-600 dark:text-red-400">Passwords do not match</p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || (activeTab === "signup" && passwordsMismatch)}
            className="w-full mt-4 flex items-center justify-center gap-1.5 rounded-lg bg-[#3ecf8e] py-2.5 text-xs font-bold text-[#042f1a] hover:bg-[#34b27b] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{activeTab === "signin" ? "Sign In to HUD" : "Register Credentials"}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
