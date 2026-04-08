"use client";

import type { ReactNode } from "react";

import { AdminSessionProvider } from "@/modules/auth/providers/AdminSessionProvider";
import { ConfirmationDialogProvider } from "@/modules/core/providers/ConfirmationDialogProvider";
import { ThemeProvider } from "@/modules/core/providers/ThemeProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ConfirmationDialogProvider>
        <AdminSessionProvider>{children}</AdminSessionProvider>
      </ConfirmationDialogProvider>
    </ThemeProvider>
  );
}
