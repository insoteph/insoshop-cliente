"use client";

import { createPortal } from "react-dom";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { ImagePlaceholder } from "@/modules/core/components/ImagePlaceholder";
import type { Tienda, TiendaDetalle } from "@/modules/tiendas/types/tiendas-types";

type StoreDetailModalProps = {
  open: boolean;
  store: Tienda | null;
  detail: TiendaDetalle | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
};

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
        className={`h-2 w-2 rounded-full ${active ? "bg-[var(--success)]" : "bg-[var(--danger)]"}`}
      />
      {active ? "Activa" : "Inactiva"}
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
  value: ReactNode;
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
          <div className="mt-0.5 truncate text-sm font-semibold text-[var(--foreground-strong)]">
            {value}
          </div>
        </div>
      </div>
    </article>
  );
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function StoreDetailModal({
  open,
  store,
  detail,
  isLoading,
  error,
  onClose,
}: StoreDetailModalProps) {
  const [isMounted, setIsMounted] = useState(open);
  const [isVisible, setIsVisible] = useState(open);
  const [isPortalReady, setIsPortalReady] = useState(false);

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

  const resolvedStore = detail ?? store;

  const createdAtText = useMemo(() => {
    if (!detail?.createdAt) {
      return "No disponible";
    }

    return formatDateTime(detail.createdAt);
  }, [detail?.createdAt]);

  const updatedAtText = useMemo(() => {
    if (!detail?.updatedAt) {
      return "No disponible";
    }

    return formatDateTime(detail.updatedAt);
  }, [detail?.updatedAt]);

  if (!resolvedStore || !isMounted || !isPortalReady || typeof window === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-[140] flex items-center justify-center bg-slate-950/60 px-3 py-4 transition-opacity duration-200 sm:px-4 sm:py-6 ${
        isVisible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`flex max-h-[84vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--background)] shadow-[var(--shadow)] transition-all duration-300 ease-out ${
          isVisible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-4 scale-[0.98] opacity-0"
        }`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={resolvedStore.nombre}
      >
        <div className="flex items-start justify-between gap-3 px-4 py-2.5 sm:px-5 sm:py-3">
          <div className="min-w-0 space-y-1">
            <p className="text-[10px] font-semibold tracking-[0.06em] text-[var(--muted)]">
              Detalle de tienda
            </p>

            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="truncate text-[1.05rem] font-semibold tracking-tight text-[var(--foreground-strong)] sm:text-[1.15rem]">
                {resolvedStore.nombre}
              </h3>
              <StatusChip active={resolvedStore.estado} />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-[12px] text-[var(--muted)]">
              <span>/{resolvedStore.slug}</span>
              <span className="text-[var(--line-strong)]">•</span>
              <span>{resolvedStore.pais}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] text-[var(--danger)] transition hover:bg-[var(--panel-muted)] hover:text-[var(--danger)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30"
            aria-label="Cerrar modal"
            title="Cerrar modal"
          >
            <MaskIcon src="/icons/cross.svg" className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3.5 sm:px-5 sm:py-4">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-[92px_minmax(0,1fr)]">
              <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--background)]">
                {resolvedStore.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resolvedStore.logoUrl}
                    alt={`Logo de ${resolvedStore.nombre}`}
                    className="h-[92px] w-full object-cover"
                  />
                ) : (
                  <div className="flex h-[92px] items-center justify-center">
                    <ImagePlaceholder
                      size={56}
                      iconPath="/icons/shop.svg"
                      iconClassName="h-6 w-6"
                    />
                  </div>
                )}
              </div>

            </div>

            {isLoading ? (
              <div className="rounded-xl border border-[var(--line)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--muted)]">
                Cargando informacion de la tienda...
              </div>
            ) : null}

            {error ? (
              <div className="rounded-xl border border-[color:color-mix(in_srgb,var(--danger)_28%,transparent)] bg-[color:color-mix(in_srgb,var(--danger-soft)_76%,var(--panel-strong)_24%)] px-4 py-4 text-sm text-[color:color-mix(in_srgb,var(--danger)_84%,var(--foreground)_16%)]">
                {error}
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
              <MetricCard
                label="Telefono"
                value={`${resolvedStore.telefonoCodigoPais} ${resolvedStore.telefono}`}
                icon={<MaskIcon src="/icons/whatsapp.svg" />}
              />
              <MetricCard
                label="Moneda"
                value={`${resolvedStore.monedaNombre} (${resolvedStore.simboloMoneda})`}
                icon={<span className="text-[12px] font-bold leading-none">$</span>}
              />
              <MetricCard
                label="Pais"
                value={resolvedStore.pais}
                icon={<span className="text-[12px] font-bold leading-none">#</span>}
              />
              <MetricCard
                label="Estado"
                value={resolvedStore.estado ? "Activa" : "Inactiva"}
                icon={
                  <span
                    aria-hidden="true"
                    className={`h-2.5 w-2.5 rounded-full ${
                      resolvedStore.estado ? "bg-[var(--success)]" : "bg-[var(--danger)]"
                    }`}
                  />
                }
              />
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5">
              <MetricCard
                label="Creada"
                value={createdAtText}
                icon={<span className="text-[12px] font-bold leading-none">+</span>}
              />
              <MetricCard
                label="Actualizada"
                value={updatedAtText}
                icon={<span className="text-[12px] font-bold leading-none">↻</span>}
              />
            </div>

          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
