import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";
import { communities } from "@/lib/communityData";

export default function CommunityPage({ params }: { params: { slug: string } }) {
  const community = communities.find((item) => item.slug === params.slug); if (!community) notFound();
  return <main className="min-h-screen bg-[#f8fafc] px-4 py-8 text-slate-900 dark:bg-[#121212] dark:text-[#ededed] sm:px-6"><div className="mx-auto max-w-3xl"><Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#21875c] hover:underline dark:text-[#3ecf8e]"><ArrowLeft className="h-3.5 w-3.5" />Back to quest board</Link><section className="mt-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#282828] dark:bg-[#1c1c1c]"><h1 className="text-2xl font-bold">{community.name}</h1><p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-zinc-400">{community.description}</p><div className="mt-5 flex items-center gap-2 text-sm font-medium"><Users className="h-4 w-4 text-[#3ecf8e]" />{community.members} members</div><h2 className="mt-6 text-sm font-semibold">What this community does</h2><div className="mt-3 grid gap-2 sm:grid-cols-3">{community.focus.map((item) => <div key={item} className="rounded-lg bg-slate-50 p-3 text-xs font-medium dark:bg-[#161616]">{item}</div>)}</div></section></div></main>;
}
