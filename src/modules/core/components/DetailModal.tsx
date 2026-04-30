"use client";

import { createPortal } from "react-dom";
import { useEffect, useState, type ReactNode } from "react";

type DetailModalSize = "md" | "lg" | "xl" | "2xl";

type DetailModalProps = {
  open: boolean;
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  headerActions?: ReactNode;
  size?: DetailModalSize;
  onClose: () => void;
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

const SIZE_CLASSES: Record<DetailModalSize, string> = {
  md: "max-w-3xl",
  lg: "max-w-5xl",
  xl: "max-w-6xl",
  "2xl": "max-w-7xl",
};

export function DetailModal({
  open,
  title,
  subtitle,
  children,
  footer,
  headerActions,
  size = "xl",
  onClose,
}: DetailModalProps) {
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

  if (!isMounted || typeof window === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 px-4 py-6 transition-opacity duration-200 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`flex max-h-[90vh] w-full ${SIZE_CLASSES[size]} flex-col overflow-hidden rounded-[28px] border border-[var(--line)] bg-[var(--background)] shadow-[var(--shadow)] transition-all duration-300 ease-out ${
          isVisible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-5 scale-95 opacity-0"
        }`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[var(--line)] px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Detalle
            </p>
            <p className="mt-1 truncate text-lg font-semibold text-[var(--foreground-strong)]">
              {title}
            </p>
            {subtitle ? (
              <div className="mt-1 text-sm text-[var(--muted)]">{subtitle}</div>
            ) : null}
          </div>

          <div className="flex items-start gap-2">
            {headerActions ? <div className="pt-0.5">{headerActions}</div> : null}
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center text-red-600 transition-transform duration-200 hover:scale-110"
              onClick={onClose}
              aria-label={`Cerrar ${title}`}
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {children}
        </div>

        {footer ? (
          <div className="border-t border-[var(--line)] px-5 py-4 sm:px-6">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
