"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAdminSession } from "@/modules/auth/providers/AdminSessionProvider";
import { buildStoreAdminUrl } from "@/modules/tiendas/lib/store-routing";

export default function DashboardPage() {
  const router = useRouter();
  const { currentUser, activeStore, isLoading } = useAdminSession();

  useEffect(() => {
    if (isLoading || !currentUser) {
      return;
    }

    if (currentUser.tieneAccesoGlobal) {
      router.replace("/admin");
      return;
    }

    if (activeStore?.subdominio) {
      window.location.replace(buildStoreAdminUrl(activeStore.subdominio));
    }
  }, [activeStore, currentUser, isLoading, router]);

  return (
    <section className="panel-card">
      <p className="text-sm text-[var(--muted)]">
        Preparando tu espacio de administración...
      </p>
    </section>
  );
}
