"use client";

import { ThemeProvider } from "@/components/themes/theme-provider";
import { Toaster } from "@/components/ui/sonner";

export function ThemeProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Toaster position="bottom-center" />
      {children}
    </ThemeProvider>
  );
} 