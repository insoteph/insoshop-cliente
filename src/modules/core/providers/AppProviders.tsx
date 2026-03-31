"use client";

import type { ReactNode } from "react";

import { ThemeProvider } from "@/modules/core/providers/ThemeProvider";
import { StoreProvider } from "@/modules/stores/context/StoreContext";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <StoreProvider>{children}</StoreProvider>
    </ThemeProvider>
  );
}
