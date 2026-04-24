"use client";

import type { ReactNode } from "react";

import { MaterialInput } from "@/modules/core/components/MaterialInput";
import type { Category } from "@/modules/categories/services/category-service";

export type ProductFormState = {
  nombre: string;
  descripcion: string;
  categoriaId: number;
  estado: boolean;
};

type ProductFormPanelProps = {
  isVisible: boolean;
  editingProductId: number | null;
  configuredProductId: number | null;
  isSaving: boolean;
  formError: string | null;
  form: ProductFormState;
  categories: Category[];
  configurationContent?: ReactNode;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onNombreChange: (value: string) => void;
  onCategoriaChange: (value: number) => void;
  onDescripcionChange: (value: string) => void;
  onEstadoChange: (value: boolean) => void;
};

export function ProductFormPanel({
  isVisible,
  editingProductId,
  configuredProductId,
  isSaving,
  formError,
  form,
  categories,
  configurationContent,
  onClose,
  onSubmit,
  onNombreChange,
  onCategoriaChange,
  onDescripcionChange,
  onEstadoChange,
}: ProductFormPanelProps) {
  return (
    <div
      className={`origin-top overflow-hidden transition-all duration-500 ease-in-out ${
        isVisible
          ? "max-h-[6000px] translate-y-0 opacity-100"
          : "pointer-events-none max-h-0 -translate-y-2 opacity-0"
      }`}
    >
      <div className="space-y-5 rounded-md border border-[var(--line)] bg-[var(--panel)] p-5 shadow-lg">
        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h4 className="text-lg font-semibold text-[var(--foreground-strong)]">
                {editingProductId ? "Editar producto" : "Crear producto"}
              </h4>
              <p className="text-sm text-[var(--muted)]">
                Completa los datos principales del producto. Luego, en esta misma
                pantalla, podrás configurar sus opciones de compra y las
                combinaciones que vas a vender.
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

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-4">
              <MaterialInput
                id="producto-nombre"
                label="Nombre del producto"
                value={form.nombre}
                onChange={(event) => onNombreChange(event.target.value)}
                required
              />

              <textarea
                value={form.descripcion}
                onChange={(event) => onDescripcionChange(event.target.value)}
                placeholder="Descripcion del producto"
                rows={8}
                className="app-input min-h-[12rem] w-full rounded-2xl px-4 py-3 text-sm"
              />
            </div>

            <div className="grid content-start gap-4">
              <select
                required
                value={form.categoriaId || ""}
                onChange={(event) => onCategoriaChange(Number(event.target.value))}
                className="app-input w-full rounded-2xl px-4 py-3 text-sm"
              >
                <option value="">Selecciona una categoria</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.nombre}
                  </option>
                ))}
              </select>

              <label className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3 text-sm text-[var(--foreground)]">
                <input
                  type="checkbox"
                  checked={form.estado}
                  onChange={(event) => onEstadoChange(event.target.checked)}
                />
                Producto activo
              </label>

              <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--panel-muted)] px-4 py-4 text-sm text-[var(--muted)]">
                Tus clientes verán opciones como color, talla o material. Luego
                aquí mismo definirás cada combinación real de venta con su
                precio, existencias e imagen.
              </div>
            </div>
          </div>

          {formError ? (
            <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
              {formError}
            </p>
          ) : null}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="app-button-primary inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-60"
            >
              <span>
                {isSaving
                  ? "Guardando..."
                  : editingProductId
                    ? "Guardar cambios"
                    : "Guardar y continuar"}
              </span>
            </button>
          </div>
        </form>

        {configuredProductId ? (
          configurationContent
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--panel-muted)] px-4 py-5 text-sm text-[var(--muted)]">
            Guarda el producto para continuar con sus opciones de compra y las
            combinaciones disponibles para vender.
          </div>
        )}
      </div>
    </div>
  );
}
