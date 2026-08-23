import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Users, Swords } from "lucide-react";
import { guilds } from "@/lib/communityData";

export default function GuildPage({ params }: { params: { slug: string } }) {
  const guild = guilds.find((item) => item.slug === params.slug); if (!guild) notFound();
  return <main className="min-h-screen bg-[#f8fafc] px-4 py-8 text-slate-900 dark:bg-[#121212] dark:text-[#ededed] sm:px-6"><div className="mx-auto max-w-3xl">
    <Link href="/skills" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#21875c] hover:underline dark:text-[#3ecf8e]"><ArrowLeft className="h-3.5 w-3.5" />Back to skills</Link>
    <section className="mt-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#282828] dark:bg-[#1c1c1c]"><span className="text-3xl">{guild.emoji}</span><h1 className="mt-3 text-2xl font-bold">{guild.name}</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-zinc-400">{guild.description}</p><div className="mt-5 flex flex-wrap gap-2">{guild.skills.map((skill) => <span key={skill} className="rounded-full bg-[#3ecf8e]/10 px-3 py-1 text-xs font-semibold text-[#21875c] dark:text-[#3ecf8e]">{skill}</span>)}</div><div className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-4 text-sm text-slate-600 dark:border-[#282828] dark:text-zinc-400"><Swords className="h-4 w-4 text-[#3ecf8e]" />{guild.quests} active quests</div></section>
  </div></main>;
}
