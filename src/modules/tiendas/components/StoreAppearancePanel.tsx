"use client";

import { useCallback, useEffect, useState } from "react";

import { PanelSectionHeader } from "@/modules/core/components/PanelSectionHeader";
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
    <section className="app-card overflow-hidden rounded-2xl shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
      <div className="px-5 py-4 sm:px-6 sm:py-5">
        <PanelSectionHeader
          title="Apariencia"
          subtitle="Administra aquí el logotipo de la tienda."
          headingLevel="h2"
        />
      </div>

      <div className="border-t border-[var(--line)]" />

      <div className="p-5 sm:p-6">
        <StoreLogoUploader
          storeId={storeId}
          currentLogoUrl={store?.logoUrl ?? ""}
          disabled={!canEdit}
          onUploaded={() => {
            void loadStore();
            toast.success(
              "Logo de tienda actualizado correctamente.",
              "Tienda",
            );
          }}
          onDeleted={() => {
            void loadStore();
            toast.success("Logo de tienda eliminado correctamente.", "Tienda");
          }}
        />
      </div>
    </section>
  );
}
