import type { Metadata } from "next";
import "./globals.css";
import RootLayoutClient from "./root-layout-client";

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
        url: "/og-image.png",
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
    images: ["/og-image.png"],
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
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
