import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { ThemeProviderWrapper } from "../account/theme-provider-wrapper";
import ClientHistoryMenu from "@/components/ClientHistoryMenu";
import { HistoryProvider } from "@/context/HistoryContext";
import { FaLinkedin } from "react-icons/fa";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Steer - Your Personal Search",
  description: "Your personalized search experience",
  metadataBase: new URL('http://localhost:3000'),
};

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProviderWrapper>
      <HistoryProvider>
        <div className={`account-page-container min-h-screen ${inter.className} antialiased flex flex-col`}>
          <div className="flex-1 flex flex-col">
            {/* History Menu */}
            <ClientHistoryMenu />
            
            {/* Page content */}
            {children}
          </div>
          
          {/* Footer */}
          <footer className="w-full bg-gradient-to-r from-[#7B2FF2] via-[#F357A8] to-[#FFD86F] py-6 px-8 flex items-center">
            <span className="text-white text-lg tracking-wide opacity-90">
              Steer - 2025
            </span>
          </footer>
        </div>
      </HistoryProvider>
    </ThemeProviderWrapper>
  );
} 