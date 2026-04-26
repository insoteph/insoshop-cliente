import type { ReactNode } from "react";

import { AuthGuard } from "@/modules/auth/components/AuthGuard";
import { DashboardShell } from "@/modules/navigation/components/DashboardShell";

export default function CatalogAttributesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthGuard>
      <DashboardShell pageTitle="Atributos">
        {children}
      </DashboardShell>
    </AuthGuard>
  );
}
