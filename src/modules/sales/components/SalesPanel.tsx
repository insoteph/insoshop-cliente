"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { DataTable } from "@/modules/core/components/DataTable";
import { useConfirmationDialog } from "@/modules/core/providers/ConfirmationDialogProvider";
import { useToast } from "@/modules/core/providers/ToastProvider";
import { formatCurrency, formatDateTime } from "@/modules/core/lib/formatters";
import { SaleDetailModal } from "@/modules/sales/components/SaleDetailModal";
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

const SALE_MODAL_CLOSE_MS = 240;

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
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isSaleDetailOpen, setIsSaleDetailOpen] = useState(false);
  const [loadingDetailIds, setLoadingDetailIds] = useState<number[]>([]);
  const [updatingSaleIds, setUpdatingSaleIds] = useState<number[]>([]);
  const [saleDetails, setSaleDetails] = useState<Record<number, SaleDetail>>(
    {},
  );
  const [detailErrors, setDetailErrors] = useState<Record<number, string>>({});
  const closeSaleDetailTimeoutRef = useRef<number | null>(null);

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

  useEffect(() => {
    return () => {
      if (closeSaleDetailTimeoutRef.current) {
        window.clearTimeout(closeSaleDetailTimeoutRef.current);
      }
    };
  }, []);

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

  function handleOpenDetail(sale: Sale) {
    if (closeSaleDetailTimeoutRef.current) {
      window.clearTimeout(closeSaleDetailTimeoutRef.current);
      closeSaleDetailTimeoutRef.current = null;
    }

    setSelectedSale(sale);
    setIsSaleDetailOpen(true);
    void loadSaleDetail(sale.id);
  }

  function handleCloseDetail() {
    setIsSaleDetailOpen(false);
    if (closeSaleDetailTimeoutRef.current) {
      window.clearTimeout(closeSaleDetailTimeoutRef.current);
    }

    closeSaleDetailTimeoutRef.current = window.setTimeout(() => {
      setSelectedSale(null);
      closeSaleDetailTimeoutRef.current = null;
    }, SALE_MODAL_CLOSE_MS);
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
      if (selectedSale?.id === sale.id) {
        await loadSaleDetail(sale.id, true);
      }
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
          primaryButtonLabel: "Ver detalle",
          onPrimaryAction: handleOpenDetail,
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
        pagination={{
          page,
          totalPages,
          totalRecords,
          onPageChange: setPage,
        }}
      />

      <SaleDetailModal
        open={isSaleDetailOpen}
        sale={selectedSale}
        detail={selectedSale ? saleDetails[selectedSale.id] ?? null : null}
        isLoading={
          selectedSale ? loadingDetailIds.includes(selectedSale.id) : false
        }
        error={
          selectedSale ? detailErrors[selectedSale.id] ?? null : null
        }
        currency={currency}
        isUpdating={
          selectedSale ? updatingSaleIds.includes(selectedSale.id) : false
        }
        canUpdateStatus={
          selectedSale ? isPendingSale(selectedSale.estadoVentaNombre) : false
        }
        onClose={handleCloseDetail}
        onRetry={() => {
          if (selectedSale) {
            void loadSaleDetail(selectedSale.id, true);
          }
        }}
        onComplete={() => {
          if (selectedSale) {
            void handleStatusChange(selectedSale, "Completado");
          }
        }}
        onCancel={() => {
          if (selectedSale) {
            void handleStatusChange(selectedSale, "Cancelado");
          }
        }}
      />
    </section>
  );
}
