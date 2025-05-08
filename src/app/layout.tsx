import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/themes/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { FaLinkedin } from "react-icons/fa";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Steer",
  description: "Search by you, for you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
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
            {/* Top navigation bar */}
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
              </div>
              <div className="flex items-center gap-4">
                <button className="flex items-center text-base text-black hover:bg-gray-100 px-2 py-1 rounded transition" style={{ fontFamily: "Times New Roman, Times, serif" }}>
                  <span className="mr-1">🌐</span> English
                </button>
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
            <div className="flex-1 flex flex-col">
              {children}
            </div>
            {/* Bottom colored tab/footer */}
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
        </ThemeProvider>
      </body>
    </html>
  );
}
