"use client";

import { ProductVariantsList } from "@/modules/products/components/ProductVariantsList";
import { useProductVariantsPanel } from "@/modules/products/hooks/useProductVariantsPanel";
import type { ProductAttributeDraft } from "@/modules/products/components/ProductAttributesPanel";
import type { ProductVariantDraft } from "@/modules/products/services/product-service";

type ProductVariantsPanelProps = {
  storeId: number;
  attributes: ProductAttributeDraft[];
  value: ProductVariantDraft[];
  onChange: (value: ProductVariantDraft[]) => void;
  disabled?: boolean;
  canEdit: boolean;
  canDelete: boolean;
};

export function ProductVariantsPanel({
  storeId,
  attributes,
  value,
  onChange,
  disabled = false,
  canEdit,
  canDelete,
}: ProductVariantsPanelProps) {
  const {
    activeAttributes,
    attributeInfoById,
    canBuildVariants,
    catalogError,
    hasMissingAttributeValues,
    isCatalogLoading,
    addVariant,
    removeVariant,
    updateVariant,
  } = useProductVariantsPanel({
    storeId,
    attributes,
    value,
    onChange,
  });

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-base font-semibold text-[var(--foreground-strong)] sm:text-lg">
            Variantes
          </h4>
          <p className="text-sm text-[var(--muted)]">
            Define precio, stock e imagen por combinación.
          </p>
        </div>
      </div>

      {catalogError ? (
        <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
          {catalogError}
        </p>
      ) : null}

      {activeAttributes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--line)] px-4 py-5 text-sm text-[var(--muted)]">
          Agrega atributos para poder definir variantes.
        </div>
      ) : null}

      {activeAttributes.length > 0 && hasMissingAttributeValues ? (
        <div className="rounded-2xl border border-dashed border-[var(--line)] px-4 py-5 text-sm text-[var(--muted)]">
          Uno o más atributos no tienen valores seleccionables. Completa esos valores antes de
          crear variantes.
        </div>
      ) : null}

      <ProductVariantsList
        variants={attributeInfoById}
        value={value}
      canEdit={canEdit}
      canDelete={canDelete}
      disabled={disabled}
      canBuildVariants={canBuildVariants}
      isCatalogLoading={isCatalogLoading}
      onAddVariant={addVariant}
        onRemove={removeVariant}
        onUpdateVariant={updateVariant}
      />
    </section>
  );
}
