"use client";

import { ResponsiveIconButton } from "@/modules/products/components/ResponsiveIconButton";
import { ProductAttributeRow } from "@/modules/products/components/ProductAttributeRow";
import { useProductAttributesPanel } from "@/modules/products/hooks/useProductAttributesPanel";

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
          <ResponsiveIconButton
            type="button"
            disabled={disabled || isCatalogLoading}
            onClick={addAttribute}
            className="app-button-primary inline-flex h-9 items-center gap-2 rounded-xl px-3 text-sm font-semibold disabled:opacity-60 sm:h-10 sm:px-3.5"
            icon={<PlusIcon />}
            label="Agregar atributo"
          />
        </div>
      ) : null}
    </section>
  );
}
