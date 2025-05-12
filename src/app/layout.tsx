import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/themes/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { FaLinkedin } from "react-icons/fa";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Steer",
  description: "Search by you, for you.",
  icons: {
    icon: [
      {
        url: '/favicon.webp',
        type: 'image/webp',
      }
    ],
    shortcut: '/favicon.webp',
    apple: '/favicon.webp',
  },
  openGraph: {
    title: "Steer - Search by you, for you",
    description: "Request an invite to our private beta",
    type: "website",
    url: "https://www.steer.app",
    siteName: "Steer",
    images: [
      {
        url: "/og/preview.jpg",
        width: 1200,
        height: 630,
        alt: "Steer - Search by you, for you",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Steer - Search by you, for you",
    description: "Request an invite to our private beta",
    images: ["/og/preview.jpg"],
  },
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
                <Link
                  href="/community"
                  className="text-base text-black hover:bg-gray-100 px-2 py-1 rounded transition"
                  style={{ fontFamily: "Times New Roman, Times, serif" }}
                >
                  community
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
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
