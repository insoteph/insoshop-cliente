"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAdminSession } from "@/modules/auth/providers/AdminSessionProvider";

export default function DashboardPage() {
  const router = useRouter();
  const { currentUser, activeStoreId, isLoading } = useAdminSession();

  useEffect(() => {
    if (isLoading || !currentUser) {
      return;
    }

    if (currentUser.tieneAccesoGlobal) {
      router.replace("/tiendas");
      return;
    }

    if (activeStoreId) {
      router.replace(`/tiendas/${activeStoreId}`);
    }
  }, [activeStoreId, currentUser, isLoading, router]);

  return (
    <section className="panel-card">
      <p className="text-sm text-[var(--muted)]">
        Preparando tu espacio de administración...
      </p>
    </section>
  );
}
