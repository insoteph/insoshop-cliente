"use client";

import { useEffect, useMemo } from "react";
import { useParams } from "next/navigation";

import { useAdminSession } from "@/modules/auth/providers/AdminSessionProvider";
import { buildStoreAdminUrl } from "@/modules/tiendas/lib/store-routing";

export default function AdminDetallePage() {
  const params = useParams<{ tiendaId: string }>();
  const { stores, isLoading } = useAdminSession();

  const tiendaId = useMemo(() => Number(params.tiendaId), [params.tiendaId]);

  useEffect(() => {
    if (isLoading || !Number.isInteger(tiendaId) || tiendaId <= 0) {
      return;
    }

    const store = stores.find((item) => item.id === tiendaId);
    if (store?.subdominio) {
      window.location.replace(buildStoreAdminUrl(store.subdominio));
      return;
    }

    const fallbackStore = stores[0];
    if (fallbackStore?.subdominio) {
      window.location.replace(buildStoreAdminUrl(fallbackStore.subdominio));
      return;
    }

    window.location.replace("/admin");
  }, [isLoading, stores, tiendaId]);

  if (!Number.isInteger(tiendaId) || tiendaId <= 0) {
    return (
      <section className="panel-card">
        <p className="text-sm text-[var(--muted)]">
          La tienda solicitada no es válida.
        </p>
      </section>
    );
  }

  return (
    <section className="panel-card">
      <p className="text-sm text-[var(--muted)]">
        Redirigiendo a la administracion de la tienda...
      </p>
    </section>
  );
}
