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
        <div className={`account-page-container h-screen max-h-screen overflow-hidden ${inter.className} antialiased flex flex-col`}>
          <div className="flex-1 flex flex-col overflow-y-auto">
            {/* History Menu */}
            <ClientHistoryMenu />
            
            {/* Page content */}
            {children}
          </div>
          
          {/* Footer removed */}
        </div>
      </HistoryProvider>
    </ThemeProviderWrapper>
  );
} 