"use client";

import { createPortal } from "react-dom";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { AppButton } from "@/modules/core/components/AppButton";
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

type SectionId = "cliente" | "entrega" | "items" | "observacion" | "totales";

const CLOSE_MS = 240;

function StatusChip({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
        active
          ? "bg-[var(--success-soft)] text-[var(--success)]"
          : "bg-[var(--danger-soft)] text-[var(--danger)]"
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-2 w-2 rounded-full ${
          active ? "bg-[var(--success)]" : "bg-[var(--danger)]"
        }`}
      />
      {active ? "Pendiente" : "Cerrada"}
    </span>
  );
}

function MaskIcon({
  src,
  className = "h-4.5 w-4.5",
}: {
  src: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block ${className}`}
      style={{
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
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

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
}) {
  return (
    <article className="rounded-xl border border-[var(--line)] bg-[var(--background)] px-3 py-2.5">
      <div className="flex items-start gap-2.5">
        {icon ? (
          <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
            {icon}
          </div>
        ) : null}

        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.08em] text-[var(--muted)]">
            {label}
          </p>
          <p className="mt-0.5 truncate text-sm font-semibold text-[var(--foreground-strong)]">
            {value}
          </p>
        </div>
      </div>
    </article>
  );
}

function SectionCard({
  id,
  title,
  subtitle,
  open,
  onToggle,
  icon,
  children,
}: {
  id: SectionId;
  title: string;
  subtitle: string;
  open: boolean;
  onToggle: (section: SectionId) => void;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--background)]">
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-[color:color-mix(in_srgb,var(--foreground)_3%,transparent)]"
      >
        <div className="min-w-0 flex items-center gap-3">
          <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
            {icon}
          </div>

          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.08em] text-[var(--muted)]">
              {title}
            </p>
            <p className="mt-0.5 text-[13px] text-[var(--muted)]">{subtitle}</p>
          </div>
        </div>

        <span
          aria-hidden="true"
          className={`inline-flex h-4 w-4 items-center justify-center transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>

      <div
        className={`grid transition-all duration-300 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden px-4 py-3">{children}</div>
      </div>
    </section>
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
  const [isPortalReady, setIsPortalReady] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<SectionId, boolean>>({
    cliente: false,
    entrega: false,
    items: false,
    observacion: false,
    totales: false,
  });

  useEffect(() => {
    setIsPortalReady(true);
  }, []);

  useEffect(() => {
    let visibleTimer: number | undefined;
    let hideTimer: number | undefined;

    if (open) {
      setIsMounted(true);
      visibleTimer = window.setTimeout(() => {
        setIsVisible(true);
      }, 20);
    } else {
      setIsVisible(false);
      hideTimer = window.setTimeout(() => {
        setIsMounted(false);
      }, CLOSE_MS);
    }

    return () => {
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

  const detailToShow = detail ?? sale;
  const isPending = detailToShow ? isPendingSale(detailToShow.estadoVentaNombre) : false;
  const totalItems =
    detail?.detalles.reduce((total, detailItem) => total + detailItem.cantidad, 0) ??
    sale?.cantidadItems ??
    0;
  const showStatusActions = canUpdateStatus && isPending;

  useEffect(() => {
    if (!open) {
      return;
    }

    setExpandedSections({
      cliente: false,
      entrega: false,
      items: false,
      observacion: false,
      totales: false,
    });
  }, [detail?.id, open]);

  const summarySubtitle = detailToShow
    ? `${detailToShow.estadoVentaNombre} · ${formatDateTime(detailToShow.createdAt)}`
    : "Cargando detalle...";

  if (!sale || !isMounted || !isPortalReady || typeof window === "undefined") {
    return null;
  }

  function toggleSection(section: SectionId) {
    setExpandedSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 px-3 py-4 transition-opacity duration-200 sm:px-4 sm:py-6 ${
        isVisible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`flex max-h-[86vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--background)] shadow-[var(--shadow)] transition-all duration-300 ease-out ${
          isVisible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-4 scale-[0.98] opacity-0"
        }`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Detalle de ${sale.numeroOrden}`}
      >
        <div className="flex items-start justify-between gap-3 px-4 py-2.5 sm:px-5 sm:py-3">
          <div className="min-w-0 space-y-1">
            <p className="text-[10px] font-semibold tracking-[0.06em] text-[var(--muted)]">
              Detalle de venta
            </p>

            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="truncate text-[1.05rem] font-semibold tracking-tight text-[var(--foreground-strong)] sm:text-[1.15rem]">
                {sale.numeroOrden}
              </h3>
              <StatusChip active={isPending} />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-[12px] text-[var(--muted)]">
              <span>{detailToShow?.tiendaNombre ?? sale.tiendaNombre}</span>
              <span className="text-[var(--line-strong)]">•</span>
              <span>{summarySubtitle}</span>
            </div>
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] text-[var(--danger)] transition hover:bg-[var(--panel-muted)] hover:text-[var(--danger)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30"
            onClick={onClose}
            aria-label="Cerrar detalle de venta"
          >
            <MaskIcon src="/icons/cross.svg" className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3.5 sm:px-5 sm:py-4">
          <div className="space-y-4">
            {isLoading && !detail ? (
              <div className="rounded-xl border border-[var(--line)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--muted)]">
                Cargando detalle de la venta...
              </div>
            ) : null}

            {error && !detail ? (
              <div className="rounded-xl border border-[color:color-mix(in_srgb,var(--danger)_28%,transparent)] bg-[color:color-mix(in_srgb,var(--danger-soft)_76%,var(--panel-strong)_24%)] px-4 py-4 text-sm text-[color:color-mix(in_srgb,var(--danger)_84%,var(--foreground)_16%)]">
                <p>{error}</p>
                <AppButton
                  variant="secondary"
                  iconPath="/icons/refresh.svg"
                  className="mt-3"
                  onClick={onRetry}
                >
                  Reintentar detalle
                </AppButton>
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
              <MetricCard
                label="Cliente"
                value={detail?.clienteNombreCompleto || "Cliente no disponible"}
                icon={<MaskIcon src="/icons/user-heart.svg" />}
              />
              <MetricCard
                label="Tienda"
                value={detailToShow?.tiendaNombre || sale.tiendaNombre}
                icon={<MaskIcon src="/icons/shop.svg" />}
              />
              <MetricCard
                label="Pago"
                value={detailToShow?.metodoPagoNombre || sale.metodoPagoNombre}
                icon={<MaskIcon src="/icons/pay.svg" />}
              />
              <MetricCard
                label="Total"
                value={formatCurrency(detailToShow?.total ?? sale.total, currency)}
                icon={<span className="text-[12px] font-bold leading-none">$</span>}
              />
            </div>

            {detail ? (
              <>
                <SectionCard
                  id="cliente"
                  title="Cliente"
                  subtitle="Datos de contacto y referencia"
                  open={expandedSections.cliente}
                  onToggle={toggleSection}
                  icon={<MaskIcon src="/icons/user-heart.svg" />}
                >
                  <div className="grid gap-2 sm:grid-cols-2 sm:gap-2.5">
                    <MetricCard
                      label="Nombre"
                      value={detail.clienteNombreCompleto || "Cliente no disponible"}
                      icon={<MaskIcon src="/icons/user-heart.svg" />}
                    />
                    <MetricCard
                      label="Telefono"
                      value={detail.clienteTelefono || "Sin telefono"}
                      icon={<MaskIcon src="/icons/whatsapp.svg" />}
                    />
                  </div>
                </SectionCard>

                <SectionCard
                  id="entrega"
                  title="Entrega y pago"
                  subtitle="Metodo, direccion y contexto comercial"
                  open={expandedSections.entrega}
                  onToggle={toggleSection}
                  icon={<MaskIcon src="/icons/delivery.svg" />}
                >
                  <div className="grid gap-2 sm:grid-cols-2 sm:gap-2.5">
                    <MetricCard
                      label="Tipo de entrega"
                      value={detail.tipoEntrega}
                      icon={<MaskIcon src="/icons/delivery.svg" />}
                    />
                    <MetricCard
                      label="Metodo de pago"
                      value={detail.metodoPagoNombre}
                      icon={<MaskIcon src="/icons/pay.svg" />}
                    />
                  </div>

                  <div className="mt-2.5 rounded-xl border border-[var(--line)] bg-[var(--background)] px-3 py-2.5">
                    <p className="text-[11px] font-semibold tracking-[0.08em] text-[var(--muted)]">
                      Direccion
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-[var(--foreground-strong)]">
                      {detail.direccion || "Recoger en local"}
                    </p>
                  </div>
                </SectionCard>

                <SectionCard
                  id="items"
                  title="Productos"
                  subtitle={`${detail.detalles.length} linea${detail.detalles.length === 1 ? "" : "s"} de venta`}
                  open={expandedSections.items}
                  onToggle={toggleSection}
                  icon={<MaskIcon src="/icons/box.svg" />}
                >
                  <SaleDetailItemsTable items={detail.detalles} currency={currency} />
                </SectionCard>

                <SectionCard
                  id="observacion"
                  title="Observacion"
                  subtitle="Notas adicionales de la venta"
                  open={expandedSections.observacion}
                  onToggle={toggleSection}
                  icon={<MaskIcon src="/icons/eye.svg" />}
                >
                  <p className="text-sm leading-6 text-[var(--foreground)]">
                    {detail.observacion || "Sin observacion adicional."}
                  </p>
                </SectionCard>

                <SectionCard
                  id="totales"
                  title="Totales"
                  subtitle="Resumen economico de la orden"
                  open={expandedSections.totales}
                  onToggle={toggleSection}
                  icon={<span className="text-[12px] font-bold leading-none">$</span>}
                >
                  <div className="grid gap-2 sm:grid-cols-2 sm:gap-2.5">
                    <MetricCard
                      label="Subtotal"
                      value={formatCurrency(detail.subTotal, currency)}
                      icon={<span className="text-[12px] font-bold leading-none">$</span>}
                    />
                    <MetricCard
                      label="Total items"
                      value={`${totalItems} unidades`}
                      icon={<MaskIcon src="/icons/box.svg" />}
                    />
                  </div>
                </SectionCard>
              </>
            ) : null}

            {showStatusActions ? (
              <div className="flex flex-wrap gap-2 pt-1">
                <AppButton
                  iconPath="/icons/check-cart.svg"
                  type="button"
                  disabled={isUpdating}
                  onClick={onComplete}
                >
                  Completar venta
                </AppButton>
                <AppButton
                  variant="danger"
                  iconPath="/icons/cancel-cart.svg"
                  type="button"
                  disabled={isUpdating}
                  onClick={onCancel}
                >
                  Cancelar venta
                </AppButton>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
