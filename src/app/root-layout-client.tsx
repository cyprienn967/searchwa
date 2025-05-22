'use client';

import { ThemeProvider } from "@/components/themes/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { FaLinkedin } from "react-icons/fa";
import Link from "next/link";
import { LoginDialog } from "@/components/login-dialog";
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import UserHeader from "@/components/UserHeader";

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || '';
  const isAccountPage = pathname.startsWith('/account');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Check if user is logged in
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Initial check
    const checkLoginStatus = () => {
      const loggedIn = localStorage.getItem("steerLoggedIn") === "true";
      setIsLoggedIn(loggedIn);
    };
    
    // Check on mount
    checkLoginStatus();
    
    // Set up event listener for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "steerLoggedIn") {
        checkLoginStatus();
      }
    };
    
    // Listen for storage events (for when logout happens in another tab)
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for login/logout within the same tab
    const handleAuthChange = () => {
      checkLoginStatus();
    };
    
    window.addEventListener('authStateChanged', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, []);

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
          {/* Show main landing navbar when not logged in and on landing page */}
          {!isLoggedIn && !isAccountPage && (
            <nav className="main-header w-full flex items-center justify-between px-8 py-4 bg-white" style={{ borderBottom: "none" }}>
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
              </div>
            </nav>
          )}
          
          {/* Show simplified user header when logged in */}
          {isLoggedIn && !isAccountPage && <UserHeader />}
          
          {children}
        </div>
      </ThemeProvider>
    </>
  );
} 