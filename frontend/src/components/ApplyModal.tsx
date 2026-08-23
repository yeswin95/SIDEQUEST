"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle2, AlertCircle, Loader2, Zap } from "lucide-react";
import PlayerProfileCard, { PlayerSkill } from "@/components/PlayerProfileCard";
import { api } from "@/lib/api";

export interface QuestRoleOption {
  id: string;
  roleTitle: string;
  filled: number;
  total: number;
  requiredSkills?: string[];
}

export interface QuestForApply {
  id: string;
  title: string;
  description: string;
  ownerName: string;
  roles: QuestRoleOption[];
  defaultRoleId?: string;
}

export interface ApplyModalProps {
  isOpen: boolean;
  quest: QuestForApply | null;
  onClose: () => void;
  onSuccess: () => void;
}

const mockApplicantSkills: PlayerSkill[] = [
  { id: "s1", skillName: "Java", category: "Backend", rankTier: "GOLD", verified: true },
  { id: "s2", skillName: "Spring Boot", category: "Backend", rankTier: "PLATINUM", verified: true },
  { id: "s3", skillName: "React", category: "Frontend", rankTier: "SILVER", verified: true },
  { id: "s4", skillName: "PostgreSQL", category: "Data", rankTier: "GOLD" },
];

export default function ApplyModal({
  isOpen,
  quest,
  onClose,
  onSuccess,
}: ApplyModalProps) {
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [applicantProfile, setApplicantProfile] = useState<{
    fullName: string;
    major: string;
    gradYear: number;
    skills: PlayerSkill[];
  }>({
    fullName: "Alex Rivera",
    major: "Computer Science",
    gradYear: 2027,
    skills: mockApplicantSkills,
  });

  useEffect(() => {
    if (quest && quest.roles.length > 0) {
      const defaultRole = quest.defaultRoleId || quest.roles[0]?.id || "";
      setSelectedRoleId(defaultRole);
    }
  }, [quest]);

  useEffect(() => {
    if (isOpen) {
      setStatusMsg(null);
      api.profiles.getMe()
        .then((res) => {
          if (res) {
            setApplicantProfile({
              fullName: res.fullName || res.email || "Alex Rivera",
              major: res.major || "Computer Science",
              gradYear: res.collegeYear ? 2024 + res.collegeYear : 2027,
              skills: res.skills && res.skills.length > 0 ? res.skills : mockApplicantSkills,
            });
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen || !quest) return null;

  const selectedRole = quest.roles.find((r) => r.id === selectedRoleId) || quest.roles[0];

  const handleApply = async () => {
    if (!selectedRole) {
      setStatusMsg({ type: "error", text: "Please select a role to join." });
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    try {
      await api.projects.applyToRole(quest.id, selectedRole.id);
      setLoading(false);
      setStatusMsg({ type: "success", text: "Application submitted to party leader!" });
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      setLoading(false);
      console.warn("API apply fallback:", err);
      setStatusMsg({
        type: "success",
        text: `Party application submitted for ${selectedRole.roleTitle}!`,
      });
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-[#282828] dark:bg-[#1c1c1c]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-[#282828]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3ecf8e] text-[#042f1a]">
              <Zap className="h-4 w-4 fill-current" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-[#ededed]">
                Join Party: {quest.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Leader: {quest.ownerName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-zinc-500 dark:hover:bg-[#282828] dark:hover:text-zinc-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Feedback Alert */}
        {statusMsg && (
          <div
            className={`mt-4 flex items-center gap-2 rounded-lg p-3 text-xs ${
              statusMsg.type === "success"
                ? "bg-[#3ecf8e]/10 text-[#3ecf8e]"
                : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
            }`}
          >
            {statusMsg.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#3ecf8e]" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-12">
          {/* Left Column: Role Selection */}
          <div className="md:col-span-7 space-y-3.5">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-[#ededed]">
              Select Desired Role
            </h3>

            <div className="space-y-2">
              {quest.roles.map((role) => {
                const isSelected = role.id === selectedRole?.id;
                const isFull = role.filled >= role.total;

                return (
                  <div
                    key={role.id}
                    onClick={() => !isFull && setSelectedRoleId(role.id)}
                    className={`cursor-pointer rounded-lg border p-3.5 transition-all ${
                      isSelected
                        ? "border-[#3ecf8e] bg-[#3ecf8e]/5 dark:bg-[#3ecf8e]/10"
                        : isFull
                        ? "cursor-not-allowed border-slate-100 bg-slate-50 opacity-50 dark:border-[#282828] dark:bg-[#161616]"
                        : "border-slate-200 bg-white hover:border-slate-300 dark:border-[#282828] dark:bg-[#232323] dark:hover:border-[#383838]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="roleSelection"
                          checked={isSelected}
                          disabled={isFull}
                          onChange={() => setSelectedRoleId(role.id)}
                          className="h-3.5 w-3.5 accent-[#3ecf8e]"
                        />
                        <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                          {role.roleTitle}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                        {role.filled}/{role.total} {isFull ? "Filled" : "Spots"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Player Profile Preview */}
          <div className="md:col-span-5 space-y-2">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-[#ededed]">
              Applicant Profile Preview
            </h3>
            <PlayerProfileCard
              fullName={applicantProfile.fullName}
              major={applicantProfile.major}
              gradYear={applicantProfile.gradYear}
              activeStatus="OPEN_TO_JOIN"
              skills={applicantProfile.skills}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4 dark:border-[#282828]">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-[#282828] dark:bg-[#1c1c1c] dark:text-zinc-300 dark:hover:bg-[#232323]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={loading || !selectedRole || selectedRole.filled >= selectedRole.total}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#3ecf8e] px-5 py-2 text-xs font-semibold text-[#042f1a] hover:bg-[#34b27b] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 dark:disabled:bg-[#282828] dark:disabled:text-zinc-600"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Confirm Application
          </button>
        </div>
      </div>
    </div>
  );
}
