import type { ReactNode } from "react";

import { DashboardShell } from "@/modules/navigation/components/DashboardShell";

export default function CatalogAttributesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <DashboardShell pageTitle="Atributos">
      {children}
    </DashboardShell>
  );
}
