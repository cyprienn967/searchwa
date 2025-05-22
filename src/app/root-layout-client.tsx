'use client';

import { ThemeProvider } from "@/components/themes/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";
import { LoginDialog } from "@/components/login-dialog";
import { usePathname } from 'next/navigation';

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || '';
  const isAccountPage = pathname.startsWith('/account') || pathname.match(/^\/[^/]+$/); // Match /account or /{username}
  
  return (
    <>
      {/* Top sliver bar */}
      <div className="w-full h-2 bg-gradient-to-r from-[#7B2FF2] via-[#F357A8] to-[#FFD86F] fixed top-0 left-0 z-50" />
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Toaster position="bottom-center" />
        <div className="min-h-screen flex flex-col justify-between">
          {/* Only show navigation when not on account pages */}
          {!isAccountPage && (
            <nav className="w-full flex items-center justify-between px-8 py-4 bg-white" style={{ borderBottom: "none" }}>
              <div className="flex items-center gap-8">
                <Link
                  href="/"
                  className="text-2xl font-semibold text-black hover:bg-gray-100 px-2 py-1 rounded transition"
                  style={{ fontFamily: "Times New Roman, Times, serif" }}
                >
                  steer
                </Link>
                <Link
                  href="/use-cases"
                  className="text-base text-black hover:bg-gray-100 px-2 py-1 rounded transition"
                  style={{ fontFamily: "Times New Roman, Times, serif" }}
                >
                  use cases
                </Link>
                <Link
                  href="/blog"
                  className="text-base text-black hover:bg-gray-100 px-2 py-1 rounded transition"
                  style={{ fontFamily: "Times New Roman, Times, serif" }}
                >
                  blog
                </Link>
                <Link
                  href="/community"
                  className="text-base text-black hover:bg-gray-100 px-2 py-1 rounded transition"
                  style={{ fontFamily: "Times New Roman, Times, serif" }}
                >
                  community
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <LoginDialog />
                <a
                  href="https://cal.com/cyprien-riboud-seydoux"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base text-black hover:bg-gray-100 px-2 py-1 rounded transition"
                  style={{ fontFamily: "Times New Roman, Times, serif" }}
                >
                  contact
                </a>
              </div>
            </nav>
          )}
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          {/* Only show footer when not on account pages */}
          {!isAccountPage && (
            <footer className="w-full bg-gradient-to-r from-[#7B2FF2] via-[#F357A8] to-[#FFD86F] py-6 px-4 flex items-center justify-between">
              <span className="text-white text-lg tracking-wide opacity-90">
                Steer - 2025
              </span>
            </footer>
          )}
        </div>
      </ThemeProvider>
    </>
  );
} 