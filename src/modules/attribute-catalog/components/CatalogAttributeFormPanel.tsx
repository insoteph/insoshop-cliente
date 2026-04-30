"use client";

import type { FormEvent } from "react";

import { CatalogAttributeValuesEditor } from "@/modules/attribute-catalog/components/CatalogAttributeValuesEditor";
import type { CatalogAttributeFormState } from "@/modules/attribute-catalog/types/catalog-attribute-form.types";
import { MaterialInput } from "@/modules/core/components/MaterialInput";

type CatalogAttributeFormPanelProps = {
  isMounted: boolean;
  isVisible: boolean;
  editingAttributeId: number | null;
  form: CatalogAttributeFormState;
  isSaving: boolean;
  formError: string | null;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onNombreChange: (value: string) => void;
  onEstadoChange: (value: boolean) => void;
  onValueTextChange: (valueId: string, valor: string) => void;
  onValueColorChange: (valueId: string, colorHexadecimal: string) => void;
  onValueUsesColorChange: (valueId: string, usaColor: boolean) => void;
  onValueOrderChange: (valueId: string, orden: string) => void;
  onAddValue: () => void;
  onRemoveValue: (valueId: string) => void;
};

export function CatalogAttributeFormPanel({
  isMounted,
  isVisible,
  editingAttributeId,
  form,
  isSaving,
  formError,
  onClose,
  onSubmit,
  onNombreChange,
  onEstadoChange,
  onValueTextChange,
  onValueColorChange,
  onValueUsesColorChange,
  onValueOrderChange,
  onAddValue,
  onRemoveValue,
}: CatalogAttributeFormPanelProps) {
  if (!isMounted) {
    return null;
  }

  return (
    <div
      className={`origin-top overflow-hidden transition-all duration-500 ease-in-out ${
        isVisible
          ? "max-h-[1800px] translate-y-0 opacity-100"
          : "pointer-events-none max-h-0 -translate-y-2 opacity-0"
      }`}
    >
      <form
        className="space-y-4 rounded-md border border-[var(--line)] bg-[var(--panel)] p-5 shadow-md"
        onSubmit={onSubmit}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="text-lg font-semibold text-[var(--foreground-strong)]">
              {editingAttributeId ? "Editar atributo" : "Crear atributo"}
            </h4>
          </div>
          <button
            type="button"
            className="app-button-secondary rounded-xl px-3 py-2 text-sm"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-stretch gap-4">
          <MaterialInput
            id="catalog-attribute-name"
            label="Nombre del atributo"
            value={form.nombre}
            onChange={(event) => onNombreChange(event.target.value)}
            className="flex-1"
            required
          />

          <label className="flex h-12 items-center gap-3 self-stretch rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 text-sm text-[var(--foreground)]">
            <input
              type="checkbox"
              checked={form.estado}
              onChange={(event) => onEstadoChange(event.target.checked)}
            />
            Atributo activo
          </label>
        </div>

        <CatalogAttributeValuesEditor
          values={form.valores}
          onAddValue={onAddValue}
          onRemoveValue={onRemoveValue}
          onTextChange={onValueTextChange}
          onColorToggle={onValueUsesColorChange}
          onColorChange={onValueColorChange}
          onOrderChange={onValueOrderChange}
        />

        {formError ? (
          <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
            {formError}
          </p>
        ) : null}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="app-button-primary rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-60"
          >
            {isSaving ? "Guardando..." : "Guardar atributo"}
          </button>
        </div>
      </form>
    </div>
  );
}

