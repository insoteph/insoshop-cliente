"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

import { formatCurrency, formatDateTime } from "@/modules/core/lib/formatters";
import { SaleDetailItemsTable } from "@/modules/sales/components/SaleDetailItemsTable";
import type { Sale, SaleDetail } from "@/modules/sales/services/sales-service";

type SaleDetailModalProps = {
  open: boolean;
  sale: Sale | null;
  detail: SaleDetail | null;
  isLoading: boolean;
  error: string | null;
  currency: string;
  isUpdating: boolean;
  canUpdateStatus: boolean;
  onClose: () => void;
  onRetry: () => void;
  onComplete: () => void;
  onCancel: () => void;
};

function CloseIcon() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-6 w-6"
      style={{
        WebkitMaskImage: "url(/icons/cross.svg)",
        maskImage: "url(/icons/cross.svg)",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        backgroundColor: "currentColor",
      }}
    />
  );
}

function isPendingSale(estadoVentaNombre: string) {
  return estadoVentaNombre.trim().toLowerCase() === "pendiente";
}

export function SaleDetailModal({
  open,
  sale,
  detail,
  isLoading,
  error,
  currency,
  isUpdating,
  canUpdateStatus,
  onClose,
  onRetry,
  onComplete,
  onCancel,
}: SaleDetailModalProps) {
  const [isMounted, setIsMounted] = useState(open);
  const [isVisible, setIsVisible] = useState(open);

  useEffect(() => {
    let mountTimer: number | undefined;
    let visibleTimer: number | undefined;
    let hideTimer: number | undefined;

    if (open) {
      mountTimer = window.setTimeout(() => {
        setIsMounted(true);
      }, 0);

      visibleTimer = window.setTimeout(() => {
        setIsVisible(true);
      }, 20);
    } else {
      visibleTimer = window.setTimeout(() => {
        setIsVisible(false);
      }, 0);

      hideTimer = window.setTimeout(() => {
        setIsMounted(false);
      }, 240);
    }

    return () => {
      if (mountTimer !== undefined) {
        window.clearTimeout(mountTimer);
      }

      if (visibleTimer !== undefined) {
        window.clearTimeout(visibleTimer);
      }

      if (hideTimer !== undefined) {
        window.clearTimeout(hideTimer);
      }
    };
  }, [open]);

  useEffect(() => {
    if (!isMounted || typeof document === "undefined") {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMounted, onClose]);

  if (!isMounted || typeof window === "undefined" || !sale) {
    return null;
  }

  const detailToShow = detail ?? sale;
  const isPending = isPendingSale(detailToShow.estadoVentaNombre);
  const totalItems =
    detail?.detalles.reduce(
      (total, detailItem) => total + detailItem.cantidad,
      0,
    ) ?? sale.cantidadItems;
  const showStatusActions = canUpdateStatus && isPending;

  return createPortal(
    <div
      className={`fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 px-4 py-6 transition-opacity duration-200 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`w-full max-w-5xl rounded-2xl border border-[var(--line)] bg-[var(--background)] shadow-[var(--shadow)] transition-all duration-300 ease-out ${
          isVisible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-5 scale-95 opacity-0"
        }`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Detalle de ${sale.numeroOrden}`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[var(--line)] px-4 py-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Detalle de venta
            </p>
            <p className="mt-1 truncate text-base font-semibold text-[var(--foreground-strong)]">
              {sale.numeroOrden}
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {detailToShow.estadoVentaNombre} · {formatDateTime(detailToShow.createdAt)}
            </p>
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center text-red-600 transition-transform duration-200 hover:scale-110"
            onClick={onClose}
            aria-label="Cerrar detalle de venta"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto px-4 py-4">
          {isLoading && !detail ? (
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-4 text-sm text-[var(--muted)]">
              Cargando detalle de la venta...
            </div>
          ) : null}

          {!isLoading && error && !detail ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
              <p>{error}</p>
              <button
                type="button"
                className="mt-3 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-700"
                onClick={onRetry}
              >
                Reintentar detalle
              </button>
            </div>
          ) : null}

          {detail ? (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 border-b border-[var(--line)] pb-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-1">
                  <p className="text-base font-semibold text-[var(--foreground)]">
                    {detail.numeroOrden}
                  </p>
                  <p className="text-sm text-[var(--muted)]">
                    {detail.estadoVentaNombre} · {formatDateTime(detail.createdAt)}
                  </p>
                </div>

                {showStatusActions ? (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={isUpdating}
                      className="app-button-primary rounded-xl px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={onComplete}
                    >
                      Completar venta
                    </button>
                    <button
                      type="button"
                      disabled={isUpdating}
                      className="app-button-danger rounded-xl px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={onCancel}
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
                    {totalItems} unidades
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

                <SaleDetailItemsTable items={detail.detalles} currency={currency} />
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
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}
