"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import AuthModal from "@/components/AuthModal";
import Link from "next/link";

export default function LoginPage() {
  const [isAuthOpen, setIsAuthOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#121212] flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar isOpen={false} onClose={() => {}} />
        <main className="flex-1 lg:pl-64 flex items-center justify-center p-6">
          <div className="text-center">
            <h1 className="text-lg font-bold text-slate-900 dark:text-[#ededed]">Sign in to SIDEQUEST</h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">You were redirected to the login route. Opening standard Sign In modal...</p>
            <Link href="/" className="mt-4 inline-block text-xs text-[#3ecf8e] hover:underline">Back to Home</Link>
          </div>
          <AuthModal isOpen={isAuthOpen} onClose={() => { setIsAuthOpen(false); window.location.href = "/"; }} initialTab="signin" />
        </main>
      </div>
    </div>
  );
}
