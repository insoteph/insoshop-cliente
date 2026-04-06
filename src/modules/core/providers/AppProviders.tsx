"use client";

import type { ReactNode } from "react";

import { AdminSessionProvider } from "@/modules/auth/providers/AdminSessionProvider";
import { ThemeProvider } from "@/modules/core/providers/ThemeProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AdminSessionProvider>{children}</AdminSessionProvider>
    </ThemeProvider>
  );
}
