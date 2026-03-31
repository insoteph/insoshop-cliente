"use client";

import type { ReactNode } from "react";

import { ThemeProvider } from "@/modules/core/providers/ThemeProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
