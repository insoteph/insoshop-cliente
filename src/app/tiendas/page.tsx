"use client";

import { useEffect, useMemo, useState } from "react";

import { DataTable } from "@/modules/core/components/DataTable";
import { ProcessingModal } from "@/modules/core/components/ProcessingModal";
import { fetchTiendas } from "@/modules/tiendas/services/tiendas-service";
import type { Tienda } from "@/modules/tiendas/types/tiendas-types";

export default function TiendasPage() {
  const [rows, setRows] = useState<Tienda[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTiendas() {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchTiendas(1, 10);
        setRows(result.items);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudieron cargar las tiendas."
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadTiendas();
  }, []);

  const headers = useMemo(
    () => [
      { key: "id", header: "ID" },
      { key: "nombre", header: "Nombre" },
      { key: "slug", header: "Slug" },
      { key: "telefono", header: "Telefono" },
      { key: "moneda", header: "Moneda" },
      { key: "logoUrl", header: "Logo URL" },
      { key: "estado", header: "Estado" },
    ] satisfies Array<{ key: keyof Tienda; header: string }>,
    []
  );

  return (
    <section className="space-y-4">
      <ProcessingModal isOpen={isLoading} label="Procesando..." />

      <header>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Tiendas</h1>
      </header>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <DataTable headers={headers} data={rows} isLoading={isLoading} />
    </section>
  );
}
