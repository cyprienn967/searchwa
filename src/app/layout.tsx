import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/themes/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zeitlist",
  description: "A simple Next.js Waitlist application with email validation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.className} ${geistMono.variable} antialiased`}
      >
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
            <div className="flex-1 flex flex-col">
              {children}
            </div>
            {/* Bottom colored tab/footer */}
            <footer className="w-full bg-gradient-to-r from-[#7B2FF2] via-[#F357A8] to-[#FFD86F] py-6 px-4 flex items-center justify-center">
              <span className="text-white text-xs tracking-wide font-mono opacity-90">
                COPYRIGHT © 2024 ZEITLIST. ALL RIGHTS RESERVED
              </span>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
