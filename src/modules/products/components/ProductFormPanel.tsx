"use client";

import type { ReactNode } from "react";

import { MaterialInput } from "@/modules/core/components/MaterialInput";
import type { Category } from "@/modules/categories/services/category-service";
<<<<<<< HEAD
=======
import {
  ProductAttributesPanel,
  type ProductAttributeDraft,
} from "@/modules/products/components/ProductAttributesPanel";
import {
  ProductVariantsPanel,
} from "@/modules/products/components/ProductVariantsPanel";
import { type ProductVariantDraft } from "@/modules/products/services/product-service";
>>>>>>> origin/develop-edgardo

export type ProductFormState = {
  nombre: string;
  descripcion: string;
  categoriaId: number;
  estado: boolean;
<<<<<<< HEAD
=======
  atributos: ProductAttributeDraft[];
  variantes: ProductVariantDraft[];
>>>>>>> origin/develop-edgardo
};

type ProductFormPanelProps = {
  storeId: number;
  isVisible: boolean;
  editingProductId: number | null;
  configuredProductId: number | null;
  isSaving: boolean;
  formError: string | null;
  form: ProductFormState;
  categories: Category[];
<<<<<<< HEAD
  configurationContent?: ReactNode;
=======
  canCreateProducts: boolean;
  canEditProducts: boolean;
  canDeleteProducts: boolean;
  canEditAttributes: boolean;
  canDeleteAttributes: boolean;
>>>>>>> origin/develop-edgardo
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onNombreChange: (value: string) => void;
  onCategoriaChange: (value: number) => void;
  onDescripcionChange: (value: string) => void;
  onEstadoChange: (value: boolean) => void;
<<<<<<< HEAD
=======
  onAtributosChange: (value: ProductAttributeDraft[]) => void;
  onVariantesChange: (value: ProductVariantDraft[]) => void;
>>>>>>> origin/develop-edgardo
};

export function ProductFormPanel({
  storeId,
  isVisible,
  editingProductId,
  configuredProductId,
  isSaving,
  formError,
  form,
  categories,
<<<<<<< HEAD
  configurationContent,
=======
  canCreateProducts,
  canEditProducts,
  canDeleteProducts,
  canEditAttributes,
  canDeleteAttributes,
>>>>>>> origin/develop-edgardo
  onClose,
  onSubmit,
  onNombreChange,
  onCategoriaChange,
  onDescripcionChange,
  onEstadoChange,
<<<<<<< HEAD
=======
  onAtributosChange,
  onVariantesChange,
>>>>>>> origin/develop-edgardo
}: ProductFormPanelProps) {
  return (
    <div
      className={`origin-top overflow-hidden transition-all duration-500 ease-in-out ${
        isVisible
          ? "max-h-[6000px] translate-y-0 opacity-100"
          : "pointer-events-none max-h-0 -translate-y-2 opacity-0"
      }`}
    >
<<<<<<< HEAD
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
=======
      <form
        className="space-y-4 rounded-md border border-[var(--line)] bg-[var(--panel)] p-5 shadow-sm"
        onSubmit={onSubmit}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="text-lg font-semibold text-[var(--foreground-strong)]">
              {editingProductId ? "Editar producto" : "Crear producto"}
            </h4>
            <p className="text-sm text-[var(--muted)]">
              Ingresa los datos basicos del producto y selecciona la categoria.
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
>>>>>>> origin/develop-edgardo
          </div>

          {formError ? (
            <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
              {formError}
            </p>
          ) : null}

<<<<<<< HEAD
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
=======
        <ProductAttributesPanel
          storeId={storeId}
          value={form.atributos}
          onChange={onAtributosChange}
          canEdit={canEditAttributes}
          canDelete={canDeleteAttributes}
        />

        <ProductVariantsPanel
          storeId={storeId}
          attributes={form.atributos}
          value={form.variantes}
          onChange={onVariantesChange}
          canEdit={canEditProducts}
          canDelete={canDeleteProducts}
        />

        {formError ? (
          <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
            {formError}
          </p>
        ) : null}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={
              isSaving || (editingProductId ? !canEditProducts : !canCreateProducts)
            }
            className="app-button-primary inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-60"
          >
            <span>{isSaving ? "Guardando..." : "Guardar"}</span>
          </button>
        </div>
      </form>
>>>>>>> origin/develop-edgardo
    </div>
  );
}
