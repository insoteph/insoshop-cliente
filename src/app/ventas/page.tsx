"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { useAdminSession } from "@/modules/auth/providers/AdminSessionProvider";
import { SalesPanel } from "@/modules/sales/components/SalesPanel";
import { fetchTiendaById } from "@/modules/tiendas/services/tiendas-service";
import type { TiendaDetalle } from "@/modules/tiendas/types/tiendas-types";

export default function VentasPage() {
  const { activeStoreId } = useAdminSession();
  const [store, setStore] = useState<TiendaDetalle | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!activeStoreId) {
      setStore(null);
      return;
    }

    let isMounted = true;
    const selectedStoreId = activeStoreId;

    async function loadStore() {
      setIsLoading(true);

      try {
        const response = await fetchTiendaById(selectedStoreId);
        if (isMounted) {
          setStore(response);
        }
      } catch {
        if (isMounted) {
          setStore(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadStore();

    return () => {
      isMounted = false;
    };
  }, [activeStoreId]);

  if (!activeStoreId) {
    return (
      <section className="panel-card space-y-3">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          Ventas
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Selecciona una tienda desde el listado para consultar sus ventas.
        </p>
        <Link
          href="/tiendas"
          className="inline-flex rounded-2xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white"
        >
          Ir a tiendas
        </Link>
      </section>
    );
  }

  if (isLoading || !store) {
    return (
      <section className="panel-card">
        <p className="text-sm text-[var(--muted)]">
          Cargando ventas de la tienda activa...
        </p>
      </section>
    );
  }

  return <SalesPanel storeId={activeStoreId} currency={store.moneda} />;
}
