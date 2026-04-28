"use client";

import { MaterialInput } from "@/modules/core/components/MaterialInput";
import type { Category } from "@/modules/categories/services/category-service";
import {
  ProductAttributesPanel,
  type ProductAttributeDraft,
} from "@/modules/products/components/ProductAttributesPanel";
import {
  ProductVariantsPanel,
} from "@/modules/products/components/ProductVariantsPanel";
import { type ProductVariantDraft } from "@/modules/products/services/product-service";

export type ProductFormState = {
  nombre: string;
  descripcion: string;
  categoriaId: number;
  estado: boolean;
  atributos: ProductAttributeDraft[];
  variantes: ProductVariantDraft[];
};

type ProductFormPanelProps = {
  storeId: number;
  isVisible: boolean;
  editingProductId: number | null;
  isSaving: boolean;
  formError: string | null;
  form: ProductFormState;
  categories: Category[];
  canCreateProducts: boolean;
  canEditProducts: boolean;
  canDeleteProducts: boolean;
  canEditAttributes: boolean;
  canDeleteAttributes: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onNombreChange: (value: string) => void;
  onCategoriaChange: (value: number) => void;
  onDescripcionChange: (value: string) => void;
  onAtributosChange: (value: ProductAttributeDraft[]) => void;
  onVariantesChange: (value: ProductVariantDraft[]) => void;
};

export function ProductFormPanel({
  storeId,
  isVisible,
  editingProductId,
  isSaving,
  formError,
  form,
  categories,
  canCreateProducts,
  canEditProducts,
  canDeleteProducts,
  canEditAttributes,
  canDeleteAttributes,
  onClose,
  onSubmit,
  onNombreChange,
  onCategoriaChange,
  onDescripcionChange,
  onAtributosChange,
  onVariantesChange,
}: ProductFormPanelProps) {
  return (
    <div
      className={`origin-top overflow-hidden transition-all duration-500 ease-in-out ${
        isVisible
          ? "max-h-[6000px] translate-y-0 opacity-100"
          : "pointer-events-none max-h-0 -translate-y-2 opacity-0"
      }`}
    >
      <form
        className="space-y-4 sm:rounded-md sm:border sm:border-[var(--line)] sm:bg-[var(--panel)] sm:p-5 sm:shadow-sm"
        onSubmit={onSubmit}
      >
        <section className="space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-3 shadow-sm sm:space-y-4 sm:p-4">
          <div className="flex items-start justify-between gap-3 sm:items-center">
            <div>
              <h4 className="text-base font-semibold text-[var(--foreground-strong)] sm:text-lg">
                {editingProductId ? "Editar producto" : "Crear producto"}
              </h4>
            </div>
            <button
              type="button"
              className="app-button-danger inline-flex h-9 items-center rounded-xl px-3 text-sm font-semibold sm:h-10 sm:px-3.5"
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
            </div>
          </div>
        </section>

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
            className="app-button-primary inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold disabled:opacity-60"
          >
            <span>{isSaving ? "Guardando..." : "Guardar"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
