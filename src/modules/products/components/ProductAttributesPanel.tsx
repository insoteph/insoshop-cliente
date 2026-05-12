"use client";

import { ProductAttributeRow } from "@/modules/products/components/ProductAttributeRow";
import { useProductAttributesPanel } from "@/modules/products/hooks/useProductAttributesPanel";
import { AppButton } from "@/modules/core/components/AppButton";

export type ProductAttributeDraft = {
  key: string;
  id?: number;
  atributoCatalogoId: number;
  atributoCatalogoValorIds: number[];
};

type ProductAttributesPanelProps = {
  storeId: number;
  value: ProductAttributeDraft[];
  onChange: (value: ProductAttributeDraft[]) => void;
  disabled?: boolean;
  canEdit: boolean;
  canDelete: boolean;
};

export function ProductAttributesPanel({
  storeId,
  value,
  onChange,
  disabled = false,
  canEdit,
  canDelete,
}: ProductAttributesPanelProps) {
  const {
    catalogError,
    canAddAttribute,
    isCatalogLoading,
    rows,
    addAttribute,
    addPickerToRow,
    removeAttribute,
    removeValueFromRow,
    selectPickerValue,
    setAttribute,
  } = useProductAttributesPanel({
    storeId,
    value,
    onChange,
    disabled,
    canEdit,
  });

  return (
    <section className="space-y-4 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-3 shadow-sm sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-base font-semibold text-[var(--foreground-strong)] sm:text-lg">
            Atributos y valores
          </h4>
          <p className="text-sm text-[var(--muted)]">
            Define los atributos del producto y los valores que lo componen.
          </p>
        </div>
      </div>

      {catalogError ? (
        <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
          {catalogError}
        </p>
      ) : null}

      {value.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--line)] px-4 py-5 text-sm text-[var(--muted)]">
          Todavia no agregaste atributos. Usa el boton de arriba para crear el
          primero.
        </div>
      ) : null}

      <div className="divide-y divide-[var(--line)]/60">
        {rows.map((row) => (
          <ProductAttributeRow
            key={row.draft.key}
            row={row}
            disabled={disabled}
            canEdit={canEdit}
            canDelete={canDelete}
            onSetAttribute={setAttribute}
            onRemoveAttribute={removeAttribute}
            onRemoveValueFromRow={removeValueFromRow}
            onAddPickerToRow={addPickerToRow}
            onSelectPickerValue={selectPickerValue}
          />
        ))}
      </div>

      {canAddAttribute ? (
        <div className="flex justify-end pt-1">
          <AppButton
            iconPath="/icons/plus-circle.svg"
            disabled={disabled || isCatalogLoading}
            onClick={addAttribute}
          >
            Agregar atributo
          </AppButton>
        </div>
      ) : null}
    </section>
  );
}
