import type { ReactNode } from "react";

import { AuthGuard } from "@/modules/auth/components/AuthGuard";
import { DashboardShell } from "@/modules/navigation/components/DashboardShell";

export default function VentasLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthGuard>
      <DashboardShell pageTitle="Ventas">{children}</DashboardShell>
    </AuthGuard>
  );
}
