"use client";

import type { FormEvent } from "react";

type CategoryFormState = {
  nombre: string;
  estado: boolean;
};

type CategoryFormPanelProps = {
  isMounted: boolean;
  isVisible: boolean;
  editingCategoryId: number | null;
  form: CategoryFormState;
  isSaving: boolean;
  formError: string | null;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onNombreChange: (value: string) => void;
  onEstadoChange: (value: boolean) => void;
};

export function CategoryFormPanel({
  isMounted,
  isVisible,
  editingCategoryId,
  form,
  isSaving,
  formError,
  onClose,
  onSubmit,
  onNombreChange,
  onEstadoChange,
}: CategoryFormPanelProps) {
  if (!isMounted) {
    return null;
  }

  return (
    <div
      className={`origin-top overflow-hidden transition-all duration-500 ease-in-out ${
        isVisible
          ? "max-h-[900px] translate-y-0 opacity-100"
          : "pointer-events-none max-h-0 -translate-y-2 opacity-0"
      }`}
    >
      <form
        className="space-y-4 rounded-md border border-[var(--line)] bg-[var(--panel)] p-5 shadow-md"
        onSubmit={onSubmit}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="text-lg font-semibold text-[var(--foreground)]">
              {editingCategoryId ? "Editar categoria" : "Crear categoria"}
            </h4>
            <p className="text-sm text-[var(--muted)]">
              Manten consistencia en nombres y estado de publicacion.
            </p>
          </div>
          <button
            type="button"
            className="app-button-secondary rounded-xl px-3 py-2 text-sm"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>

        <input
          required
          value={form.nombre}
          onChange={(event) => onNombreChange(event.target.value)}
          placeholder="Nombre de la categoria"
          className="app-input rounded-2xl px-4 py-3 text-sm"
        />

        <label className="flex items-center gap-3 text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            checked={form.estado}
            onChange={(event) => onEstadoChange(event.target.checked)}
          />
          Categoria activa
        </label>

        {formError ? (
          <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
            {formError}
          </p>
        ) : null}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="app-button-primary rounded-2xl px-4 py-3 text-sm font-semibold disabled:opacity-60"
          >
            {isSaving
              ? "Guardando..."
              : editingCategoryId
                ? "Actualizar"
                : "Crear"}
          </button>
        </div>
      </form>
    </div>
  );
}
