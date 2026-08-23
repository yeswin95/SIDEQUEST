"use client";

import { X, Check, Upload, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import MetalPlayerCard, { PlayerCardConfig } from "./MetalPlayerCard";
import { SkillRank } from "@/lib/tierConfig";

interface CardCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialConfig: PlayerCardConfig;
  onSave: (config: PlayerCardConfig) => void;
  userData: {
    fullName: string;
    level: number;
    skillsCount: number;
    questsCount: number;
    achievementsCount: number;
    badgesCount: number;
    github?: string;
    avatarUrl?: string;
    mainSkill?: string;
  };
}

const PRESET_GRADIENTS = [
  { label: "Supabase Green", start: "#052e22", end: "#0f766e" },
  { label: "Royal Gold", start: "#6b4e16", end: "#d4af37" },
  { label: "Midnight Blue", start: "#0f172a", end: "#475569" },
  { label: "Cyberpunk", start: "#4a044e", end: "#db2777" },
  { label: "Ocean Chrome", start: "#0f3b57", end: "#38bdf8" },
  // { label: "Supabase Green", start: "#064e3b", end: "#065f46" },
  // { label: "Royal Gold", start: "#c5923aff", end: "#854d0e" },
  // { label: "Midnight Blue", start: "#0f172a", end: "#1e293b" },
  // { label: "Cyberpunk", start: "#581c87", end: "#db2777" },
  // { label: "Ocean Chrome", start: "#0c4a6e", end: "#0284c7" },
];

export default function CardCustomizationModal({
  isOpen,
  onClose,
  initialConfig,
  onSave,
  userData,
}: CardCustomizationModalProps) {
  const [config, setConfig] = useState<PlayerCardConfig>(initialConfig);

  useEffect(() => {
    if (isOpen) {
      setConfig(initialConfig);
    }
  }, [isOpen, initialConfig]);

  if (!isOpen) return null;

  const updateConfig = <K extends keyof PlayerCardConfig>(key: K, value: PlayerCardConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateConfig("backgroundImage", reader.result as string);
        updateConfig("backgroundType", "image");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetImage = () => {
    updateConfig("backgroundImage", undefined);
    updateConfig("backgroundType", "default");
  };

  const handleSubmit = () => {
    onSave(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-[#282828] dark:bg-[#1c1c1c] flex flex-col md:flex-row overflow-hidden max-h-[90vh] md:max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Column: Customization Form */}
        <div className="flex-1 p-6 overflow-y-auto border-b md:border-b-0 md:border-r border-slate-100 dark:border-[#282828]">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#282828] mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-[#ededed]">Customize Player Card</h2>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">Configure your digital identity card styling</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-zinc-500 dark:hover:bg-[#282828] dark:hover:text-zinc-200 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Rank Tier Override */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">Rank Rarity Override</label>
              <div className="grid grid-cols-5 gap-1">
                {(["BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND"] as SkillRank[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => updateConfig("tier", t)}
                    className={`rounded py-1 text-[10px] font-bold border transition-all ${config.tier === t
                      ? "border-[#3ecf8e] bg-[#3ecf8e]/10 text-[#3ecf8e]"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 dark:border-[#282828] dark:bg-[#161616] dark:text-zinc-400"
                      }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Title / Tagline */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">Custom Title / Role</label>
              <input
                type="text"
                maxLength={30}
                value={config.customTitle || ""}
                onChange={(e) => updateConfig("customTitle", e.target.value)}
                placeholder="e.g. Frontend Architect"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:border-[#3ecf8e] focus:bg-white focus:outline-none dark:border-[#282828] dark:bg-[#161616] dark:text-zinc-100 transition-all"
              />
              <span className="text-[9px] text-slate-400 dark:text-zinc-500 block text-right mt-1">
                {30 - (config.customTitle || "").length} characters left
              </span>
            </div>

            {/* Background Style Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">Card Background Styling</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(["default", "pattern", "gradient", "image"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => updateConfig("backgroundType", type)}
                    className={`rounded py-1.5 text-[10px] font-bold border capitalize transition-all ${config.backgroundType === type
                      ? "border-[#3ecf8e] bg-[#3ecf8e]/10 text-[#3ecf8e]"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 dark:border-[#282828] dark:bg-[#161616] dark:text-zinc-400"
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Render conditional settings based on background selection */}
            {config.backgroundType === "pattern" && (
              <div className="p-3 bg-slate-50 dark:bg-[#161616] rounded-lg border border-slate-100 dark:border-[#282828] space-y-2">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400">Select Pattern</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["circuit", "carbon", "brushed", "holo"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => updateConfig("pattern", p)}
                      className={`rounded py-1 text-[10px] font-bold border uppercase transition-all ${config.pattern === p
                        ? "border-[#3ecf8e] bg-[#3ecf8e]/15 text-[#3ecf8e]"
                        : "border-transparent bg-white text-slate-600 hover:border-slate-200 dark:bg-[#202020] dark:text-zinc-400 dark:hover:border-zinc-700"
                        }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {config.backgroundType === "gradient" && (
              <div className="p-3 bg-slate-50 dark:bg-[#161616] rounded-lg border border-slate-100 dark:border-[#282828] space-y-2">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400">Select Gradient Presets</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {PRESET_GRADIENTS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        updateConfig("gradientStart", p.start);
                        updateConfig("gradientEnd", p.end);
                      }}
                      className={`flex items-center gap-2 text-left rounded p-1.5 text-[10px] font-semibold border bg-white dark:bg-[#202020] transition-all hover:border-slate-300 dark:hover:border-zinc-700 ${config.gradientStart === p.start
                        ? "border-[#3ecf8e] ring-1 ring-[#3ecf8e]"
                        : "border-transparent"
                        }`}
                    >
                      <span
                        className="w-5 h-3 rounded shrink-0 shadow-sm"
                        style={{ background: `linear-gradient(135deg, ${p.start}, ${p.end})` }}
                      />
                      <span className="truncate text-slate-700 dark:text-zinc-300">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {config.backgroundType === "image" && (
              <div className="p-3 bg-slate-50 dark:bg-[#161616] rounded-lg border border-slate-100 dark:border-[#282828] space-y-2">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400">Background Photo</label>
                <div className="flex gap-2">
                  <label className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white hover:border-[#3ecf8e] p-3 text-xs font-semibold text-slate-600 hover:text-[#3ecf8e] dark:border-zinc-700 dark:bg-[#202020] dark:text-zinc-400 cursor-pointer transition-all">
                    <Upload className="h-4 w-4" />
                    Upload Image
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                  {config.backgroundImage && (
                    <button
                      type="button"
                      onClick={handleResetImage}
                      className="p-3 rounded-lg border border-red-200 bg-white hover:bg-red-50 text-red-500 dark:border-red-950/20 dark:bg-[#202020] dark:hover:bg-red-950/10 cursor-pointer transition-colors"
                      title="Reset back to default"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Toggle Info Visibilities */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-2">Toggle Card Visibility Information</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { key: "showAvatar", label: "Profile Image" },
                  { key: "showUsername", label: "Player Name" },
                  { key: "showLevel", label: "Level" },
                  { key: "showTier", label: "Rank Tier" },
                  { key: "showMainSkill", label: "Main Skill Tag" },
                  { key: "showQuestCount", label: "Quest Count" },
                  { key: "showAchievementCount", label: "Achievements" },
                  { key: "showCampusBadgeCount", label: "Badges" },
                ].map((item) => {
                  const val = config[item.key as keyof PlayerCardConfig] as boolean;
                  return (
                    <label key={item.key} className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/50 p-2 cursor-pointer transition-all hover:bg-slate-50 dark:border-[#282828] dark:bg-[#161616] text-slate-700 dark:text-zinc-300">
                      <input
                        type="checkbox"
                        checked={val}
                        onChange={(e) => updateConfig(item.key as keyof PlayerCardConfig, e.target.checked)}
                        className="rounded border-slate-300 text-[#3ecf8e] focus:ring-[#3ecf8e] dark:border-zinc-700"
                      />
                      <span>{item.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Metal Card Live Preview */}
        <div className="w-full md:w-[420px] bg-slate-50 dark:bg-[#131313] p-6 flex flex-col justify-between items-center min-h-[300px]">
          <div className="w-full text-center mb-4 md:mb-0">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1">Live Preview</h3>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500">Move your cursor over the card to test the tilt reflections</p>
          </div>

          <div className="my-auto w-full flex items-center justify-center">
            <MetalPlayerCard config={config} userData={userData} />
          </div>

          <div className="flex gap-2 w-full mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-[#282828] dark:bg-[#1c1c1c] dark:text-zinc-400 dark:hover:bg-[#232323] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-grow-[2] rounded-lg bg-[#3ecf8e] py-2 text-xs font-bold text-[#042f1a] hover:bg-[#34b27b] transition-colors flex items-center justify-center gap-1.5"
            >
              <Check className="h-4 w-4" />
              Save custom card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
