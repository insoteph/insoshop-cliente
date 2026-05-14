"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

import { PanelSectionHeader } from "@/modules/core/components/PanelSectionHeader";
import { CategoryFormPanel } from "@/modules/categories/components/CategoryFormPanel";
import type { FormEvent } from "react";

type CategoryFormState = {
  nombre: string;
  estado: boolean;
};

type CategoryFormModalProps = {
  isMounted: boolean;
  isVisible: boolean;
  editingCategoryId: number | null;
  form: CategoryFormState;
  isSaving: boolean;
  formError: string | null;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onNombreChange: (value: string) => void;
};

function CloseIcon() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-5 w-5"
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

export function CategoryFormModal({
  isMounted,
  isVisible,
  editingCategoryId,
  form,
  isSaving,
  formError,
  onClose,
  onSubmit,
  onNombreChange,
}: CategoryFormModalProps) {
  const [isPortalReady, setIsPortalReady] = useState(false);

  useEffect(() => {
    setIsPortalReady(true);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined" || !isMounted) {
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

  if (!isMounted || !isPortalReady || typeof window === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/55 px-4 py-6 transition-opacity duration-200 ${
        isVisible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`w-full max-w-xl overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--background)] shadow-[var(--shadow)] transition-all duration-300 ease-out ${
          isVisible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-3 scale-[0.98] opacity-0"
        }`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={editingCategoryId ? "Editar categoria" : "Crear categoria"}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] px-5 py-4">
          <PanelSectionHeader
            title={editingCategoryId ? "Editar categoria" : "Crear categoria"}
            subtitle="Manten consistencia en nombres y estado de publicacion."
            headingLevel="h4"
          />

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] text-[var(--foreground)] transition hover:bg-[var(--panel-muted)] hover:text-[var(--danger)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30"
            aria-label="Cerrar modal"
            title="Cerrar modal"
          >
            <CloseIcon />
          </button>
        </div>

        <CategoryFormPanel
          editingCategoryId={editingCategoryId}
          form={form}
          isSaving={isSaving}
          formError={formError}
          onClose={onClose}
          onSubmit={onSubmit}
          onNombreChange={onNombreChange}
        />
      </div>
    </div>,
    document.body,
  );
}
