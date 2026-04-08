"use client";

import { MaterialInput } from "@/modules/core/components/MaterialInput";
import { ProductImageUploader } from "@/modules/products/components/ProductImageUploader";
import type { Category } from "@/modules/categories/services/category-service";
import type { ProductImagePayload } from "@/modules/products/services/product-service";

export type ProductFormState = {
  nombre: string;
  descripcion: string;
  categoriaId: number;
  precio: string;
  cantidad: string;
  estado: boolean;
  imagenes: ProductImagePayload[];
};

type ProductFormPanelProps = {
  isVisible: boolean;
  editingProductId: number | null;
  isSaving: boolean;
  formError: string | null;
  form: ProductFormState;
  categories: Category[];
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onNombreChange: (value: string) => void;
  onCategoriaChange: (value: number) => void;
  onPrecioChange: (value: string) => void;
  onCantidadChange: (value: string) => void;
  onDescripcionChange: (value: string) => void;
  onEstadoChange: (value: boolean) => void;
  onImagenesChange: (imagenes: ProductImagePayload[]) => void;
};

export function ProductFormPanel({
  isVisible,
  editingProductId,
  isSaving,
  formError,
  form,
  categories,
  onClose,
  onSubmit,
  onNombreChange,
  onCategoriaChange,
  onPrecioChange,
  onCantidadChange,
  onDescripcionChange,
  onEstadoChange,
  onImagenesChange,
}: ProductFormPanelProps) {
  return (
    <div
      className={`origin-top overflow-hidden transition-all duration-500 ease-in-out ${
        isVisible
          ? "max-h-[2500px] translate-y-0 opacity-100"
          : "pointer-events-none max-h-0 -translate-y-2 opacity-0"
      }`}
    >
      <form
        className="space-y-4 rounded-md border border-[var(--line)] bg-[var(--panel)] p-5 shadow-lg"
        onSubmit={onSubmit}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="text-lg font-semibold text-[var(--foreground-strong)]">
              {editingProductId ? "Editar producto" : "Crear producto"}
            </h4>
            <p className="text-sm text-[var(--muted)]">
              Ingresa los datos de tu producto, selecciona la categoría y sube
              imágenes para promocionarlo
            </p>
          </div>
          <button
            type="button"
            className="app-button-danger rounded-xl px-3 py-2 text-sm"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>

        <MaterialInput
          id="producto-nombre"
          label="Nombre del producto"
          value={form.nombre}
          onChange={(event) => onNombreChange(event.target.value)}
          required
        />

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <textarea
              value={form.descripcion}
              onChange={(event) => onDescripcionChange(event.target.value)}
              placeholder="Descripcion del producto"
              rows={7}
              className="app-input h-full min-h-[11rem] w-full rounded-2xl px-4 py-3 text-sm"
            />
          </div>

          <div className="grid content-start gap-4">
            <select
              required
              value={form.categoriaId || ""}
              onChange={(event) => onCategoriaChange(Number(event.target.value))}
              className="app-input w-full justify-self-start rounded-2xl px-4 py-3 text-sm md:w-auto md:min-w-[260px] md:max-w-[320px]"
            >
              <option value="">Selecciona una categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.nombre}
                </option>
              ))}
            </select>

            <div className="grid gap-4 lg:grid-cols-2">
              <MaterialInput
                id="producto-precio"
                label="Precio"
                type="number"
                min="0.01"
                step="0.01"
                value={form.precio}
                onChange={(event) => onPrecioChange(event.target.value)}
                required
              />
              <MaterialInput
                id="producto-cantidad"
                label="Cantidad disponible"
                type="number"
                min="0"
                value={form.cantidad}
                onChange={(event) => onCantidadChange(event.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <label className="flex items-center gap-3 text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            checked={form.estado}
            onChange={(event) => onEstadoChange(event.target.checked)}
          />
          Producto activo
        </label>

        <ProductImageUploader
          value={form.imagenes}
          onChange={onImagenesChange}
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
            className="app-button-primary inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-60"
          >
            <span>{isSaving ? "Guardando..." : "Guardar"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
