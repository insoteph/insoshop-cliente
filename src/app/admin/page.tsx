"use client";

import { useEffect } from "react";

import { useAdminSession } from "@/modules/auth/providers/AdminSessionProvider";
import { buildStoreAdminUrl } from "@/modules/tiendas/lib/store-routing";
import { StoreAdminView } from "@/modules/tiendas/components/StoreAdminView";
import { StoreDirectoryView } from "@/modules/tiendas/components/StoreDirectoryView";

export default function AdminPage() {
  const { currentUser, activeStore, hostSubdomain, hostStoreId, isLoading } =
    useAdminSession();

  useEffect(() => {
    if (isLoading || !currentUser) {
      return;
    }

    if (hostStoreId) {
      return;
    }

    if (!currentUser.tieneAccesoGlobal && activeStore?.subdominio) {
      window.location.replace(buildStoreAdminUrl(activeStore.subdominio));
    }
  }, [activeStore, currentUser, hostStoreId, isLoading]);

  if (!currentUser) {
    return (
      <section className="panel-card">
        <p className="text-sm text-[var(--muted)]">
          Cargando administracion...
        </p>
      </section>
    );
  }

  if (hostSubdomain && hostStoreId) {
    return <StoreAdminView storeId={hostStoreId} />;
  }

  if (hostSubdomain && !hostStoreId) {
    return (
      <section className="panel-card">
        <p className="text-sm text-[var(--muted)]">
          El subdominio solicitado no corresponde a una tienda valida.
        </p>
      </section>
    );
  }

  if (!currentUser.tieneAccesoGlobal) {
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
