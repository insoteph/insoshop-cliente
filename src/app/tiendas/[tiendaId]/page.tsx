"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";

import { useAdminSession } from "@/modules/auth/providers/AdminSessionProvider";
import { StoreAdminView } from "@/modules/tiendas/components/StoreAdminView";

export default function TiendaDetallePage() {
  const params = useParams<{ tiendaId: string }>();
  const router = useRouter();
  const { currentUser, stores, isLoading } = useAdminSession();

  const tiendaId = useMemo(() => Number(params.tiendaId), [params.tiendaId]);

  useEffect(() => {
    if (isLoading || !currentUser || !Number.isInteger(tiendaId) || tiendaId <= 0) {
      return;
    }

    const canAccessStore = stores.some((store) => store.id === tiendaId);

    if (!canAccessStore) {
      if (currentUser.tieneAccesoGlobal) {
        router.replace("/tiendas");
        return;
      }

      router.replace(`/tiendas/${stores[0]?.id ?? ""}`);
    }
  }, [currentUser, isLoading, router, stores, tiendaId]);

  if (!Number.isInteger(tiendaId) || tiendaId <= 0) {
    return (
      <section className="panel-card">
        <p className="text-sm text-[var(--muted)]">
          La tienda solicitada no es válida.
        </p>
      </section>
    );
  }

  if (!stores.some((store) => store.id === tiendaId)) {
    return (
      <section className="panel-card">
        <p className="text-sm text-[var(--muted)]">
          Validando acceso a la tienda solicitada...
        </p>
      </section>
    );
  }

  return <StoreAdminView storeId={tiendaId} />;
}
