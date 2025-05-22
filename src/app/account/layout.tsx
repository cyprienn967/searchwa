import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { ThemeProviderWrapper } from "./theme-provider-wrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Steer Account",
  description: "Your personalized search experience",
};

export default function AccountLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className + " antialiased"}>
        {/* Top sliver bar */}
        <div className="w-full h-2 bg-gradient-to-r from-[#7B2FF2] via-[#F357A8] to-[#FFD86F] fixed top-0 left-0 z-50" />
        <ThemeProviderWrapper>
          <div className="min-h-screen flex flex-col">
            <div className="flex-1 flex flex-col">
              {children}
            </div>
          </div>
        </ThemeProviderWrapper>
      </body>
    </html>
  );
} 