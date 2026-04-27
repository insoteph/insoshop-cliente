"use client";

import { createPortal } from "react-dom";
import { useEffect, useState, type ReactNode } from "react";

type DetailItem = {
  label: string;
  value: ReactNode;
};

type DataTableMobileDetailModalProps = {
  open: boolean;
  title: string;
  items: DetailItem[];
  onClose: () => void;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
};

function CloseIcon() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-4 w-4"
      style={{
        WebkitMaskImage: "url(/icons/cross.svg)",
        maskImage: "url(/icons/cross.svg)",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        backgroundColor: "#dc2626",
      }}
    />
  );
}

export function DataTableMobileDetailModal({
  open,
  title,
  items,
  onClose,
  primaryActionLabel,
  onPrimaryAction,
}: DataTableMobileDetailModalProps) {
  const [isMounted, setIsMounted] = useState(open);
  const [isVisible, setIsVisible] = useState(open);

  useEffect(() => {
    if (open) {
      const frame = requestAnimationFrame(() => {
        setIsMounted(true);
        setIsVisible(true);
      });

      return () => cancelAnimationFrame(frame);
    }

    const frame = requestAnimationFrame(() => {
      setIsVisible(false);
    });
    const timeout = window.setTimeout(() => {
      setIsMounted(false);
    }, 180);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
    };
  }, [open]);

  if (!isMounted || typeof window === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 px-4 py-6 transition-opacity duration-200 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`w-full max-w-[28rem] rounded-[26px] border border-[var(--line)] bg-white shadow-[var(--shadow)] transition-all duration-300 ease-out ${
          isVisible ? "translate-y-0 scale-100 opacity-100" : "translate-y-3 scale-97 opacity-0"
        }`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[var(--line)] px-4 py-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Detalle del registro
            </p>
            <p className="mt-1 text-base font-semibold text-[var(--foreground-strong)]">
              {title}
            </p>
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--panel-muted)] text-[var(--foreground)]"
            onClick={onClose}
            aria-label="Cerrar detalle"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-3 overflow-y-auto px-4 py-4">
          {items.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                {item.label}
              </p>
              <div className="mt-1 text-sm text-[var(--foreground)]">{item.value}</div>
            </div>
          ))}
        </div>

        {primaryActionLabel && onPrimaryAction ? (
          <div className="border-t border-[var(--line)] px-4 py-4">
            <button
              type="button"
              className="app-button-primary inline-flex h-11 w-full items-center justify-center rounded-2xl px-4 text-sm font-semibold"
              onClick={onPrimaryAction}
            >
              {primaryActionLabel}
            </button>
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
