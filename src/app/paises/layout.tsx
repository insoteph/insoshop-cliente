import type { ReactNode } from "react";

import { DashboardShell } from "@/modules/navigation/components/DashboardShell";

export default function PaisesLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <DashboardShell pageTitle="Paises">
      {children}
    </DashboardShell>
  );
}
