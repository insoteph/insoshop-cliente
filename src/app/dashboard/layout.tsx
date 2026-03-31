import type { ReactNode } from "react";

import { DashboardShell } from "@/modules/navigation/components/DashboardShell";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
