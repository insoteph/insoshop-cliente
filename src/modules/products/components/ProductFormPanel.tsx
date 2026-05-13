"use client";

import { MaterialInput } from "@/modules/core/components/MaterialInput";
import { AppButton } from "@/modules/core/components/AppButton";
import type { Category } from "@/modules/categories/services/category-service";
import {
  ProductAttributesPanel,
  type ProductAttributeDraft,
} from "@/modules/products/components/ProductAttributesPanel";
import {
  ProductVariantsPanel,
} from "@/modules/products/components/ProductVariantsPanel";
import { type ProductVariantDraft } from "@/modules/products/services/product-service";
import type { ProductFormState } from "@/modules/products/types/product-form.types";

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
  submitLabel?: string;
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
  submitLabel = "Guardar producto",
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
        className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)] shadow-sm"
        onSubmit={onSubmit}
      >
        <div className="px-4 py-4 sm:px-5 sm:py-5">
          <div className="space-y-3">
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
          </div>
        </div>

        <div className="border-t border-[var(--line)] px-4 py-4 sm:px-5 sm:py-5">
          <ProductAttributesPanel
            storeId={storeId}
            value={form.atributos}
            onChange={onAtributosChange}
            canEdit={canEditAttributes}
            canDelete={canDeleteAttributes}
          />
        </div>

        <div className="border-t border-[var(--line)] px-4 py-4 sm:px-5 sm:py-5">
          <ProductVariantsPanel
            storeId={storeId}
            attributes={form.atributos}
            value={form.variantes}
            onChange={onVariantesChange}
            canEdit={canEditProducts}
            canDelete={canDeleteProducts}
          />
        </div>

        {formError ? (
          <div className="border-t border-[var(--line)] px-4 py-4 sm:px-5 sm:py-5">
            <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
              {formError}
            </p>
          </div>
        ) : null}

        <div className="border-t border-[var(--line)] px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex justify-end">
            <AppButton
              iconPath="/icons/save.svg"
              type="submit"
              disabled={
                isSaving || (editingProductId ? !canEditProducts : !canCreateProducts)
              }
            >
              <span>{isSaving ? "Guardando..." : submitLabel}</span>
            </AppButton>
          </div>
        </div>
      </form>
    </div>
  );
}
