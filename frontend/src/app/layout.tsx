import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-provider";

export const metadata: Metadata = {
  title: "SIDEQUEST — Campus Quest Feed & Skill Matrix",
  description: "Gamified skill verification & campus project matchmaker for students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-[#121212] dark:text-[#ededed] antialiased selection:bg-[#3ecf8e]/20 selection:text-[#3ecf8e]">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
