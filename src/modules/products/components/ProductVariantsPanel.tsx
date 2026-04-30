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

function PlusIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

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
    <section className="space-y-4 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-3 shadow-sm sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-base font-semibold text-[var(--foreground-strong)] sm:text-lg">
            Variantes
          </h4>
          <p className="text-sm text-[var(--muted)]">
            Define combinaciones reales del producto con precio, existencias e imagen.
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
        onRemove={removeVariant}
        onUpdateVariant={updateVariant}
      />

      {canEdit ? (
        <div className="flex justify-end pt-1">
          <button
            type="button"
            disabled={disabled || isCatalogLoading || !canBuildVariants}
            onClick={addVariant}
            className="app-button-primary inline-flex h-9 items-center gap-2 rounded-xl px-3 text-sm font-semibold disabled:opacity-60 sm:h-10 sm:px-3.5"
          >
            <PlusIcon />
            <span className="hidden sm:inline">Agregar variante</span>
          </button>
        </div>
      ) : null}
    </section>
  );
}
