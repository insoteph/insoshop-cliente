"use client";

import { useEffect, useMemo, useState } from "react";

import { DataTable } from "@/modules/core/components/DataTable";
import { useConfirmationDialog } from "@/modules/core/providers/ConfirmationDialogProvider";
import { useToast } from "@/modules/core/providers/ToastProvider";
import { formatCurrency, formatDateTime } from "@/modules/core/lib/formatters";
import { SaleDetailItemsTable } from "@/modules/sales/components/SaleDetailItemsTable";
import {
  fetchSaleDetail,
  fetchSales,
  updateSaleStatus,
  type Sale,
  type SaleDetail,
} from "@/modules/sales/services/sales-service";

type SalesPanelProps = {
  storeId: number;
  currency: string;
};

function isPendingSale(estadoVentaNombre: string) {
  return estadoVentaNombre.trim().toLowerCase() === "pendiente";
}

export function SalesPanel({ storeId, currency }: SalesPanelProps) {
  const { confirm } = useConfirmationDialog();
  const toast = useToast();
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
  const [reloadTick, setReloadTick] = useState(0);
  const [expandedSaleIds, setExpandedSaleIds] = useState<number[]>([]);
  const [loadingDetailIds, setLoadingDetailIds] = useState<number[]>([]);
  const [updatingSaleIds, setUpdatingSaleIds] = useState<number[]>([]);
  const [saleDetails, setSaleDetails] = useState<Record<number, SaleDetail>>(
    {},
  );
  const [detailErrors, setDetailErrors] = useState<Record<number, string>>({});

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
            : "No se pudieron cargar las ventas.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadSales();
  }, [fechaDesde, fechaHasta, page, pageSize, reloadTick, search, storeId]);

  async function loadSaleDetail(saleId: number, force = false) {
    if (
      (!force && saleDetails[saleId]) ||
      loadingDetailIds.includes(saleId)
    ) {
      return;
    }

    setLoadingDetailIds((current) =>
      current.includes(saleId) ? current : [...current, saleId],
    );
    setDetailErrors((current) => {
      const next = { ...current };
      delete next[saleId];
      return next;
    });

    try {
      const detail = await fetchSaleDetail(saleId, storeId);
      setSaleDetails((current) => ({
        ...current,
        [saleId]: detail,
      }));
    } catch (loadError) {
      setDetailErrors((current) => ({
        ...current,
        [saleId]:
          loadError instanceof Error
            ? loadError.message
            : "No se pudo cargar el detalle de la venta.",
      }));
    } finally {
      setLoadingDetailIds((current) =>
        current.filter((currentId) => currentId !== saleId),
      );
    }
  }

  function handleToggleDetail(sale: Sale) {
    const isExpanded = expandedSaleIds.includes(sale.id);

    if (isExpanded) {
      setExpandedSaleIds((current) =>
        current.filter((currentId) => currentId !== sale.id),
      );
      return;
    }

    setExpandedSaleIds((current) => [...current, sale.id]);
    void loadSaleDetail(sale.id);
  }

  async function handleStatusChange(
    sale: Sale,
    estado: "Completado" | "Cancelado",
  ) {
    if (!isPendingSale(sale.estadoVentaNombre)) {
      setError("Solo las ventas pendientes pueden cambiar de estado.");
      return;
    }

    if (updatingSaleIds.includes(sale.id)) {
      return;
    }

    const confirmed = await confirm({
      title:
        estado === "Completado"
          ? "Completar venta"
          : "Cancelar venta pendiente",
      description:
        estado === "Completado"
          ? `La venta ${sale.numeroOrden} quedara finalizada y ya no podra volver a pendiente ni cancelarse.`
          : `La venta ${sale.numeroOrden} se cancelara y el stock reservado regresara al inventario.`,
      confirmLabel: estado === "Completado" ? "Completar" : "Cancelar venta",
      cancelLabel: "Cerrar",
      variant: estado === "Completado" ? "primary" : "danger",
    });

    if (!confirmed) {
      return;
    }

    setUpdatingSaleIds((current) => [...current, sale.id]);
    setError(null);

    try {
      await updateSaleStatus(sale.id, storeId, estado);
      setExpandedSaleIds((current) =>
        current.includes(sale.id) ? current : [...current, sale.id],
      );
      await loadSaleDetail(sale.id, true);
      setReloadTick((current) => current + 1);
      toast.success(
        estado === "Completado"
          ? "Venta completada correctamente."
          : "Venta cancelada correctamente.",
        "Venta",
      );
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "No se pudo actualizar el estado de la venta.",
      );
    } finally {
      setUpdatingSaleIds((current) =>
        current.filter((currentId) => currentId !== sale.id),
      );
    }
  }

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
    [currency],
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
        rowActions={{
          primaryButtonLabel: (sale) =>
            expandedSaleIds.includes(sale.id) ? "Ocultar" : "Detalle",
          onPrimaryAction: handleToggleDetail,
          dropdownOptions: [
            {
              label: "Completar venta",
              hidden: (sale) => !isPendingSale(sale.estadoVentaNombre),
              onClick: (sale) => {
                void handleStatusChange(sale, "Completado");
              },
            },
            {
              label: "Cancelar venta",
              hidden: (sale) => !isPendingSale(sale.estadoVentaNombre),
              onClick: (sale) => {
                void handleStatusChange(sale, "Cancelado");
              },
            },
          ],
        }}
        expandedRow={{
          isExpanded: (sale) => expandedSaleIds.includes(sale.id),
          render: (sale) => {
            const detail = saleDetails[sale.id];
            const detailError = detailErrors[sale.id];
            const isLoadingDetail = loadingDetailIds.includes(sale.id);
            const isUpdating = updatingSaleIds.includes(sale.id);
            const itemCount =
              detail?.detalles.reduce(
                (total, detailItem) => total + detailItem.cantidad,
                0,
              ) ?? sale.cantidadItems;

            if (isLoadingDetail && !detail) {
              return (
                <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-4 text-sm text-[var(--muted)]">
                  Cargando detalle de la venta...
                </div>
              );
            }

            if (detailError && !detail) {
              return (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
                  <p>{detailError}</p>
                  <button
                    type="button"
                    className="mt-3 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-700"
                    onClick={() => {
                      void loadSaleDetail(sale.id, true);
                    }}
                  >
                    Reintentar detalle
                  </button>
                </div>
              );
            }

            if (!detail) {
              return (
                <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-4 text-sm text-[var(--muted)]">
                  No hay detalle disponible para esta venta.
                </div>
              );
            }

            return (
              <div className="space-y-4 rounded-2xl border border-[var(--line)] bg-[var(--background)] p-4">
                <div className="flex flex-col gap-3 border-b border-[var(--line)] pb-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-[var(--foreground)]">
                      {detail.numeroOrden}
                    </p>
                    <p className="text-sm text-[var(--muted)]">
                      {detail.estadoVentaNombre} · {formatDateTime(detail.createdAt)}
                    </p>
                  </div>

                  {isPendingSale(detail.estadoVentaNombre) ? (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={isUpdating}
                        className="app-button-primary rounded-xl px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={() => {
                          void handleStatusChange(sale, "Completado");
                        }}
                      >
                        Completar venta
                      </button>
                      <button
                        type="button"
                        disabled={isUpdating}
                        className="app-button-danger rounded-xl px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={() => {
                          void handleStatusChange(sale, "Cancelado");
                        }}
                      >
                        Cancelar venta
                      </button>
                    </div>
                  ) : null}
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="space-y-1 rounded-xl border border-[var(--line)] bg-[var(--background-soft)] p-4">
                    <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                      Cliente
                    </p>
                    <p className="font-medium text-[var(--foreground)]">
                      {detail.clienteNombreCompleto || "Cliente no disponible"}
                    </p>
                    <p className="text-sm text-[var(--muted)]">
                      {detail.clienteTelefono || "Sin teléfono"}
                    </p>
                  </div>

                  <div className="space-y-1 rounded-xl border border-[var(--line)] bg-[var(--background-soft)] p-4">
                    <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                      Entrega y pago
                    </p>
                    <p className="font-medium text-[var(--foreground)]">
                      {detail.tipoEntrega}
                    </p>
                    <p className="text-sm text-[var(--muted)]">
                      {detail.metodoPagoNombre}
                    </p>
                  </div>

                  <div className="space-y-1 rounded-xl border border-[var(--line)] bg-[var(--background-soft)] p-4">
                    <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                      Dirección
                    </p>
                    <p className="text-sm text-[var(--foreground)]">
                      {detail.direccion || "Recoger en local"}
                    </p>
                  </div>

                  <div className="space-y-1 rounded-xl border border-[var(--line)] bg-[var(--background-soft)] p-4">
                    <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                      Resumen
                    </p>
                    <p className="font-medium text-[var(--foreground)]">
                      {itemCount} unidades
                    </p>
                    <p className="text-sm text-[var(--muted)]">
                      Total: {formatCurrency(detail.total, currency)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 rounded-xl border border-[var(--line)] bg-[var(--background-soft)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-sm font-semibold text-[var(--foreground)]">
                      Productos de la venta
                    </h4>
                    <span className="text-xs text-[var(--muted)]">
                      {detail.detalles.length} lineas
                    </span>
                  </div>

                  <SaleDetailItemsTable
                    items={detail.detalles}
                    currency={currency}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                  <div className="space-y-1 rounded-xl border border-[var(--line)] bg-[var(--background-soft)] p-4">
                    <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                      Observación
                    </p>
                    <p className="text-sm text-[var(--foreground)]">
                      {detail.observacion || "Sin observación adicional."}
                    </p>
                  </div>

                  <div className="space-y-2 rounded-xl border border-[var(--line)] bg-[var(--background-soft)] p-4 text-sm text-[var(--foreground)]">
                    <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                      Totales
                    </p>
                    <div className="flex items-center justify-between gap-3">
                      <span>Subtotal</span>
                      <span>{formatCurrency(detail.subTotal, currency)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 font-semibold">
                      <span>Total</span>
                      <span>{formatCurrency(detail.total, currency)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          },
        }}
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
