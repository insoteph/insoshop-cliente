"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { DataTable } from "@/modules/core/components/DataTable";
import { PaginationControls } from "@/modules/core/components/PaginationControls";
import { formatDate } from "@/modules/core/lib/formatters";
import { fetchTiendas } from "@/modules/tiendas/services/tiendas-service";
import type { Tienda } from "@/modules/tiendas/types/tiendas-types";

export function StoreDirectoryView() {
  const [stores, setStores] = useState<Tienda[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "activos" | "inactivos" | "todos"
  >("todos");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    async function loadStores() {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchTiendas({
          page,
          pageSize,
          search: debouncedSearch,
          estadoFiltro: statusFilter,
        });

        setStores(result.items);
        setTotalPages(result.totalPages);
        setTotalRecords(result.totalRecords);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudo cargar el listado de tiendas."
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadStores();
  }, [debouncedSearch, page, pageSize, statusFilter]);

  const columns = useMemo(
    () => [
      {
        key: "nombre",
        header: "Tienda",
        render: (store: Tienda) => (
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)]">
              {store.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={store.logoUrl}
                  alt={store.nombre}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-[var(--foreground)]">
                {store.nombre}
              </p>
              <p className="text-xs text-[var(--muted)]">/{store.slug}</p>
            </div>
          </div>
        ),
      },
      {
        key: "telefono",
        header: "Teléfono",
      },
      {
        key: "createdAt",
        header: "Creación",
        render: (store: Tienda) => formatDate(store.createdAt),
      },
      {
        key: "estado",
        header: "Estado",
        render: (store: Tienda) => (
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
              store.estado
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-200 text-slate-700"
            }`}
          >
            {store.estado ? "Activa" : "Inactiva"}
          </span>
        ),
      },
      {
        key: "acciones",
        header: "Acciones",
        render: (store: Tienda) => (
          <Link
            href={`/tiendas/${store.id}`}
            className="inline-flex rounded-xl border border-[var(--line)] px-3 py-2 text-xs font-semibold text-[var(--foreground)]"
          >
            Administrar tienda
          </Link>
        ),
      },
    ],
    []
  );

  return (
    <section className="space-y-5">
      <div className="overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--panel)] shadow-[var(--shadow)]">
        <div className="grid gap-6 bg-[linear-gradient(135deg,rgba(31,94,255,0.18),rgba(13,185,129,0.12))] px-6 py-8 lg:grid-cols-[minmax(0,1.3fr)_320px]">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              Administración global
            </p>
            <h2 className="text-3xl font-semibold text-[var(--foreground)]">
              Gestiona todas las tiendas desde un solo lugar
            </h2>
            <p className="max-w-2xl text-sm text-[var(--muted)]">
              Busca, filtra y entra al contexto de cada tienda para revisar
              productos, categorías, ventas, usuarios e información general.
            </p>
          </div>

          <div className="grid gap-3 rounded-[1.75rem] border border-[var(--line)] bg-[var(--panel)]/95 p-5 shadow-[var(--shadow)] backdrop-blur md:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[1.25rem] border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                Tiendas registradas
              </p>
              <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
                {totalRecords}
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                Página actual
              </p>
              <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
                {page}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="panel-card space-y-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
          <input
            value={searchTerm}
            onChange={(event) => {
              setPage(1);
              setSearchTerm(event.target.value);
            }}
            placeholder="Buscar por nombre, slug, teléfono o moneda"
            className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3 text-sm text-[var(--foreground)] outline-none"
          />
          <select
            value={statusFilter}
            onChange={(event) => {
              setPage(1);
              setStatusFilter(
                event.target.value as "activos" | "inactivos" | "todos"
              );
            }}
            className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3 text-sm text-[var(--foreground)] outline-none"
          >
            <option value="todos">Todos los estados</option>
            <option value="activos">Solo activas</option>
            <option value="inactivos">Solo inactivas</option>
          </select>
        </div>

        {error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}
      </div>

      <DataTable
        headers={columns}
        data={stores}
        isLoading={isLoading}
        rowKey="id"
        emptyMessage="No hay tiendas que coincidan con los filtros aplicados."
      />

      <PaginationControls
        page={page}
        totalPages={totalPages}
        totalRecords={totalRecords}
        onPageChange={setPage}
      />
    </section>
  );
}
