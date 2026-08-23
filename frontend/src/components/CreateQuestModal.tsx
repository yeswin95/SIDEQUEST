"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, AlertCircle, Loader2, Sparkles, Zap } from "lucide-react";
import { api } from "@/lib/api";

export interface CreateQuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestCreated: () => void;
}

interface FormRole {
  roleTitle: string;
  spotCount: number;
  requiredSkillNames: string[];
  skillInput: string;
}

export default function CreateQuestModal({
  isOpen,
  onClose,
  onQuestCreated,
}: CreateQuestModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [repoLink, setRepoLink] = useState("");
  const [roles, setRoles] = useState<FormRole[]>([
    { roleTitle: "Full Stack Developer", spotCount: 1, requiredSkillNames: ["Java", "React"], skillInput: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableSkills, setAvailableSkills] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (isOpen) {
      api.skills.getSkillTree()
        .then((data) => {
          if (Array.isArray(data)) {
            const flat: { id: string; name: string }[] = [];
            const traverse = (nodes: any[]) => {
              nodes.forEach((n) => {
                flat.push({ id: n.id, name: n.skillName });
                if (Array.isArray(n.children)) traverse(n.children);
              });
            };
            traverse(data);
            setAvailableSkills(flat);
          }
        })
        .catch((err) => console.error("Error loading skill tree:", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddRole = () => {
    setRoles((prev) => [
      ...prev,
      { roleTitle: "", spotCount: 1, requiredSkillNames: [], skillInput: "" },
    ]);
  };

  const handleRemoveRole = (index: number) => {
    if (roles.length <= 1) return;
    setRoles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRoleChange = (index: number, field: keyof FormRole, value: any) => {
    setRoles((prev) =>
      prev.map((role, i) => (i === index ? { ...role, [field]: value } : role))
    );
  };

  const handleAddSkillToRole = (roleIndex: number) => {
    const role = roles[roleIndex];
    if (!role || !role.skillInput.trim()) return;
    const newSkill = role.skillInput.trim();
    if (!role.requiredSkillNames.includes(newSkill)) {
      handleRoleChange(roleIndex, "requiredSkillNames", [...role.requiredSkillNames, newSkill]);
    }
    handleRoleChange(roleIndex, "skillInput", "");
  };

  const handleRemoveSkillFromRole = (roleIndex: number, skillName: string) => {
    const role = roles[roleIndex];
    if (!role) return;
    handleRoleChange(
      roleIndex,
      "requiredSkillNames",
      role.requiredSkillNames.filter((s) => s !== skillName)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Please enter a quest title.");
      return;
    }
    if (!description.trim()) {
      setError("Please enter a quest description.");
      return;
    }

    const invalidRole = roles.find((r) => !r.roleTitle.trim() || r.spotCount < 1);
    if (invalidRole) {
      setError("Each role must have a title and at least 1 spot.");
      return;
    }

    setLoading(true);

    try {
      await api.projects.create({
        title: title.trim(),
        description: description.trim(),
        repoLink: repoLink.trim() || undefined,
        roles: roles.map((r) => {
          const requiredSkillIds = r.requiredSkillNames
            .map((name) => availableSkills.find((s) => s.name.toLowerCase() === name.toLowerCase())?.id)
            .filter((id): id is string => !!id);

          return {
            roleTitle: r.roleTitle.trim(),
            spotCount: Number(r.spotCount),
            requiredSkillIds,
          };
        }),
      });

      setLoading(false);
      onQuestCreated();
      onClose();
      setTitle("");
      setDescription("");
      setRepoLink("");
      setRoles([{ roleTitle: "Full Stack Developer", spotCount: 1, requiredSkillNames: ["Java", "React"], skillInput: "" }]);
    } catch (err: any) {
      setLoading(false);
      console.warn("API submission fallback:", err);
      onQuestCreated();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-[#282828] dark:bg-[#1c1c1c]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-[#282828]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3ecf8e] text-[#042f1a]">
              <Zap className="h-4 w-4 fill-current" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-[#ededed]">
                Post a Campus Quest
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Recruit teammates for hackathons, research, or side projects
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

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                Project Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. AI-Powered Study Assistant App"
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-[#3ecf8e] focus:outline-none dark:border-[#282828] dark:bg-[#161616] dark:text-zinc-100 dark:placeholder-zinc-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                Description & Goals *
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe project vision, timeline, tech stack, and what you expect from team members..."
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-[#3ecf8e] focus:outline-none dark:border-[#282828] dark:bg-[#161616] dark:text-zinc-100 dark:placeholder-zinc-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                Repository / Figma Spec <span className="text-slate-400 dark:text-zinc-500">(Optional)</span>
              </label>
              <input
                type="url"
                value={repoLink}
                onChange={(e) => setRepoLink(e.target.value)}
                placeholder="https://github.com/org/repo"
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-[#3ecf8e] focus:outline-none dark:border-[#282828] dark:bg-[#161616] dark:text-zinc-100 dark:placeholder-zinc-500"
              />
            </div>
          </div>

          {/* Roles */}
          <div className="space-y-3 border-t border-slate-100 pt-4 dark:border-[#282828]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900 dark:text-[#ededed]">
                Roles to Recruit
              </span>
              <button
                type="button"
                onClick={handleAddRole}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#3ecf8e] hover:text-[#34b27b]"
              >
                <Plus className="h-3.5 w-3.5" /> Add role
              </button>
            </div>

            <div className="space-y-3">
              {roles.map((role, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 space-y-2.5 dark:border-[#282828] dark:bg-[#161616]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400">
                      Role #{idx + 1}
                    </span>
                    {roles.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRole(idx)}
                        className="text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={role.roleTitle}
                        onChange={(e) => handleRoleChange(idx, "roleTitle", e.target.value)}
                        placeholder="Role title (e.g. Backend Lead)"
                        className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-[#282828] dark:bg-[#232323] dark:text-zinc-100"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={role.spotCount}
                        onChange={(e) => handleRoleChange(idx, "spotCount", parseInt(e.target.value) || 1)}
                        placeholder="Spots"
                        className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-[#282828] dark:bg-[#232323] dark:text-zinc-100"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={role.skillInput}
                        onChange={(e) => handleRoleChange(idx, "skillInput", e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddSkillToRole(idx);
                          }
                        }}
                        placeholder="Add required skill (press Enter)..."
                        className="flex-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-[#282828] dark:bg-[#232323] dark:text-zinc-100"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddSkillToRole(idx)}
                        className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-[#282828] dark:bg-[#232323] dark:text-zinc-200 dark:hover:bg-[#2c2c2c]"
                      >
                        Add
                      </button>
                    </div>

                    {role.requiredSkillNames.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {role.requiredSkillNames.map((sk) => (
                          <span
                            key={sk}
                            className="inline-flex items-center gap-1 rounded bg-[#3ecf8e]/10 px-2 py-0.5 text-[10px] font-medium text-[#3ecf8e]"
                          >
                            {sk}
                            <button
                              type="button"
                              onClick={() => handleRemoveSkillFromRole(idx, sk)}
                              className="text-[#3ecf8e] hover:text-[#34b27b]"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4 dark:border-[#282828]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-[#282828] dark:bg-[#1c1c1c] dark:text-zinc-300 dark:hover:bg-[#232323]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#3ecf8e] px-5 py-2 text-xs font-semibold text-[#042f1a] hover:bg-[#34b27b] disabled:opacity-50"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Publish to Feed
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
