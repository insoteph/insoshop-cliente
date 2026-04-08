"use client";

import { useEffect, useMemo, useState } from "react";

import { DataTable } from "@/modules/core/components/DataTable";

import { formatCurrency, formatDateTime } from "@/modules/core/lib/formatters";
import { fetchSales, type Sale } from "@/modules/sales/services/sales-service";

type SalesPanelProps = {
  storeId: number;
  currency: string;
};

export function SalesPanel({ storeId, currency }: SalesPanelProps) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSales() {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchSales({
          storeId,
          page,
          pageSize,
          search,
          fechaDesde: fechaDesde || undefined,
          fechaHasta: fechaHasta || undefined,
        });

        setSales(result.items);
        setTotalPages(result.totalPages);
        setTotalRecords(result.totalRecords);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudieron cargar las ventas."
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadSales();
  }, [fechaDesde, fechaHasta, page, pageSize, search, storeId]);

  const columns = useMemo(
    () => [
      {
        key: "numeroOrden",
        header: "Orden",
        render: (sale: Sale) => (
          <div className="space-y-1">
            <p className="font-semibold text-[var(--foreground)]">
              {sale.numeroOrden}
            </p>
            <p className="text-xs text-[var(--muted)]">
              {formatDateTime(sale.createdAt)}
            </p>
          </div>
        ),
      },
      {
        key: "estadoVentaNombre",
        header: "Estado",
      },
      {
        key: "metodoPagoNombre",
        header: "Pago",
      },
      {
        key: "cantidadItems",
        header: "Items",
        render: (sale: Sale) => `${sale.cantidadItems} productos`,
      },
      {
        key: "total",
        header: "Total",
        render: (sale: Sale) => formatCurrency(sale.total, currency),
      },
      {
        key: "observacion",
        header: "Observación",
        render: (sale: Sale) => (
          <span className="text-sm text-[var(--muted)]">
            {sale.observacion || "Sin observación"}
          </span>
        ),
      },
    ],
    [currency]
  );

  return (
    <section className="space-y-5">
      <div className="space-y-4 rounded-md border border-[var(--line)] bg-[var(--panel)] p-5 shadow-lg">
        <div>
          <h3 className="text-lg font-semibold text-[var(--foreground)]">
            Ventas de la tienda
          </h3>
          <p className="text-sm text-[var(--muted)]">
            Revisa órdenes, montos, método de pago y estado comercial.
          </p>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
          <input
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            placeholder="Buscar por orden, estado u observación"
            className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3 text-sm text-[var(--foreground)] outline-none"
          />
          <input
            type="date"
            value={fechaDesde}
            onChange={(event) => {
              setPage(1);
              setFechaDesde(event.target.value);
            }}
            className="app-input rounded-2xl px-4 py-3 text-sm"
          />
          <input
            type="date"
            value={fechaHasta}
            onChange={(event) => {
              setPage(1);
              setFechaHasta(event.target.value);
            }}
            className="app-input rounded-2xl px-4 py-3 text-sm"
          />
        </div>

        {error ? (
          <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
            {error}
          </p>
        ) : null}
      </div>

      <DataTable
        headers={columns}
        data={sales}
        isLoading={isLoading}
        rowKey="id"
        emptyMessage="No hay ventas para los filtros aplicados."
        pagination={{
          page,
          totalPages,
          totalRecords,
          onPageChange: setPage,
        }}
      />
    </section>
  );
}
