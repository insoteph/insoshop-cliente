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
          isVisible ? "translate-y-0 scale-100 opacity-100" : "translate-y-5 scale-95 opacity-0"
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
            className="inline-flex h-10 w-10 items-center justify-center text-red-600 transition-transform duration-200 hover:scale-110"
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
