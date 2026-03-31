import type { ReactNode } from "react";

import { AuthGuard } from "@/modules/auth/components/AuthGuard";
import { DashboardShell } from "@/modules/navigation/components/DashboardShell";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthGuard>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}
