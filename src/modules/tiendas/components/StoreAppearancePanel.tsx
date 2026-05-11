"use client";

import { useCallback, useEffect, useState } from "react";

import { useToast } from "@/modules/core/providers/ToastProvider";
import { fetchTiendaById } from "@/modules/tiendas/services/tiendas-service";
import { StoreLogoUploader } from "@/modules/tiendas/components/StoreLogoUploader";
import type { TiendaDetalle } from "@/modules/tiendas/types/tiendas-types";

type StoreAppearancePanelProps = {
  storeId: number;
  canEdit: boolean;
};

export function StoreAppearancePanel({
  storeId,
  canEdit,
}: StoreAppearancePanelProps) {
  const toast = useToast();
  const [store, setStore] = useState<TiendaDetalle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStore = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchTiendaById(storeId);
      setStore(result);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudo cargar la apariencia de la tienda.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    void loadStore();
  }, [loadStore]);

  if (isLoading) {
    return (
      <section className="panel-card">
        <p className="text-sm text-[var(--muted)]">Cargando apariencia...</p>
      </section>
    );
  }

  if (error && !store) {
    return (
      <section>
        <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
          {error}
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-[var(--foreground-strong)]">
          Apariencia
        </h3>
        <p className="text-sm text-[var(--muted)]">
          Administra aquí el logotipo de la tienda.
        </p>
      </div>

      <StoreLogoUploader
        storeId={storeId}
        currentLogoUrl={store?.logoUrl ?? ""}
        disabled={!canEdit}
        onUploaded={() => {
          void loadStore();
          toast.success("Logo de tienda actualizado correctamente.", "Tienda");
        }}
        onDeleted={() => {
          void loadStore();
          toast.success("Logo de tienda eliminado correctamente.", "Tienda");
        }}
      />
    </section>
  );
}
