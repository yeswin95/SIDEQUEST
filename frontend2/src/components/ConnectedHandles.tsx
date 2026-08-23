"use client";

import { Github, Linkedin, Mail, Code2, Globe } from "lucide-react";

export interface ConnectedHandle {
  label: string;
  href: string;
  icon: "github" | "linkedin" | "leetcode" | "codechef" | "portfolio" | "mail";
  status?: string;
}

const ICONS: Record<ConnectedHandle["icon"], any> = {
  github: Github,
  linkedin: Linkedin,
  leetcode: Code2,
  codechef: Code2,
  portfolio: Globe,
  mail: Mail,
};

const defaultHandles: ConnectedHandle[] = [
  { label: "github.com/alexrivera", href: "https://github.com", icon: "github", status: "Connected" },
  { label: "linkedin.com/in/alexrivera", href: "https://linkedin.com", icon: "linkedin", status: "Connected" },
  { label: "leetcode.com/alexrivera", href: "https://leetcode.com", icon: "leetcode", status: "Connected" },
  { label: "codechef.com/users/alexrivera", href: "https://codechef.com", icon: "codechef", status: "Connect" },
  { label: "alexrivera.dev", href: "https://alexrivera.dev", icon: "portfolio", status: "Connect" },
];

export default function ConnectedHandles({
  handles = defaultHandles,
  title = "Connected Handles",
}: {
  handles?: ConnectedHandle[];
  title?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-[#282828] dark:bg-[#1c1c1c]">
      <div className="mb-3 text-xs font-semibold text-slate-900 dark:text-[#ededed]">{title}</div>
      <div className="space-y-1 text-xs text-slate-600 dark:text-zinc-400">
        {handles.map((h) => {
          const Icon = ICONS[h.icon];
          const connected = h.status === "Connected";
          return (
            <a
              key={h.label}
              href={h.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-slate-50 dark:hover:bg-[#232323]"
            >
              <span className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-slate-500 dark:text-zinc-400" />
                <span>{h.label}</span>
              </span>
              <span className={`text-[10px] font-medium ${connected ? "text-[#3ecf8e]" : "text-slate-400 dark:text-zinc-500"}`}>
                {h.status}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}