import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { ThemeProviderWrapper } from "./theme-provider-wrapper";
import { FaLinkedin } from "react-icons/fa";

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
          <div className="min-h-screen flex flex-col justify-between">
            <div className="flex-1 flex flex-col">
              {children}
            </div>
            {/* Bottom colored footer */}
            <footer className="w-full bg-gradient-to-r from-[#7B2FF2] via-[#F357A8] to-[#FFD86F] py-6 px-4 flex items-center justify-between">
              <span className="text-white text-lg tracking-wide opacity-90">
                Steer - 2025
              </span>
              <div className="flex gap-4">
                <a
                  href="https://www.linkedin.com/in/cyprienriboudseydoux/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn Cyprien"
                >
                  <FaLinkedin className="text-white" size={36} />
                </a>
                <a
                  href="https://www.linkedin.com/in/aidanzhang06/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn Aidan"
                >
                  <FaLinkedin className="text-white" size={36} />
                </a>
              </div>
            </footer>
          </div>
        </ThemeProviderWrapper>
      </body>
    </html>
  );
} 