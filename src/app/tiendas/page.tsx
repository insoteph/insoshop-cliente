"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { permissions } from "@/modules/auth/lib/permissions";
import { useAdminSession } from "@/modules/auth/providers/AdminSessionProvider";
import { StoreDirectoryView } from "@/modules/tiendas/components/StoreDirectoryView";

export default function TiendasPage() {
  const router = useRouter();
  const { currentUser, activeStoreId, isLoading, hasPermission } =
    useAdminSession();

  useEffect(() => {
    if (isLoading || !currentUser) {
      return;
    }

    if (!hasPermission(permissions.tiendas.ver) && activeStoreId) {
      router.replace(`/tiendas/${activeStoreId}`);
      return;
    }

    if (!currentUser.tieneAccesoGlobal && activeStoreId) {
      router.replace(`/tiendas/${activeStoreId}`);
    }
  }, [activeStoreId, currentUser, hasPermission, isLoading, router]);

  if (!currentUser?.tieneAccesoGlobal) {
    return (
      <section className="panel-card">
        <p className="text-sm text-[var(--muted)]">
          Redirigiendo al contexto de tu tienda...
        </p>
      </section>
    );
  }

  return <StoreDirectoryView />;
}
