"use client";

import { useState } from "react";

import { AppButton } from "@/modules/core/components/AppButton";
import { PanelSectionHeader } from "@/modules/core/components/PanelSectionHeader";
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

export function ProductAttributesPanel({
  storeId,
  value,
  onChange,
  disabled = false,
  canEdit,
  canDelete,
}: ProductAttributesPanelProps) {
  const [expandedRowKey, setExpandedRowKey] = useState<string | null>(
    null,
  );

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

  const effectiveExpandedRowKey =
    expandedRowKey && value.some((draft) => draft.key === expandedRowKey)
      ? expandedRowKey
      : null;

  const handleAddAttribute = () => {
    const newAttributeKey = addAttribute();
    if (newAttributeKey) {
      setExpandedRowKey(newAttributeKey);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PanelSectionHeader
          title="Atributos"
          subtitle="Define las bases que luego usarán tus variantes."
          headingLevel="h4"
        />
      </div>

      {catalogError ? (
        <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
          {catalogError}
        </p>
      ) : null}

      {value.length === 0 ? (
        <div className="space-y-3 rounded-2xl border border-dashed border-[var(--line)] bg-[var(--panel-muted)] px-4 py-5">
          <p className="text-sm text-[var(--muted)]">
            Todavia no agregaste atributos.
          </p>
          {canAddAttribute ? (
            <div className="flex justify-start">
              <AppButton
                iconPath="/icons/plus-circle.svg"
                disabled={disabled || isCatalogLoading}
                onClick={handleAddAttribute}
              >
                Agregar atributo
              </AppButton>
            </div>
          ) : null}
        </div>
      ) : null}

      {value.length > 0 ? (
        <div className="space-y-3">
          {rows.map((row) => (
            <ProductAttributeRow
              key={row.draft.key}
              row={row}
              expanded={effectiveExpandedRowKey === row.draft.key}
              disabled={disabled}
              canEdit={canEdit}
              canDelete={canDelete}
              onToggleExpanded={() =>
                setExpandedRowKey((current) =>
                  current === row.draft.key ? null : row.draft.key,
                )
              }
              onSetAttribute={setAttribute}
              onRemoveAttribute={removeAttribute}
              onRemoveValueFromRow={removeValueFromRow}
              onAddPickerToRow={addPickerToRow}
              onSelectPickerValue={selectPickerValue}
            />
          ))}
        </div>
      ) : null}

      {value.length > 0 && canAddAttribute ? (
        <div className="flex justify-end pt-1">
          <AppButton
            iconPath="/icons/plus-circle.svg"
            disabled={disabled || isCatalogLoading}
            onClick={handleAddAttribute}
          >
            Agregar atributo
          </AppButton>
        </div>
      ) : null}
    </section>
  );
}
