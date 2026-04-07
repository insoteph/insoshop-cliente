import type { ReactNode } from "react";

import { AuthGuard } from "@/modules/auth/components/AuthGuard";
import { DashboardShell } from "@/modules/navigation/components/DashboardShell";

export default function TiendasLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthGuard>
      <DashboardShell pageTitle="Tiendas">{children}</DashboardShell>
    </AuthGuard>
  );
}
