import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { ThemeProviderWrapper } from "./theme-provider-wrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Steer Account",
  description: "Your personalized search experience",
};

// This layout overrides the root layout completely
export default function AccountLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className + " antialiased overflow-hidden"}>
        {/* Top sliver bar */}
        <div className="w-full h-2 bg-gradient-to-r from-[#7B2FF2] via-[#F357A8] to-[#FFD86F] fixed top-0 left-0 z-50" />
        <ThemeProviderWrapper>
          <div className="h-screen max-h-screen flex flex-col overflow-hidden">
            <div className="flex-1 flex flex-col overflow-y-auto">
              {children}
            </div>
            {/* No footer here */}
          </div>
        </ThemeProviderWrapper>
      </body>
    </html>
  );
} 