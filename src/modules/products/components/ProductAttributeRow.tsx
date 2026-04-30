"use client";

import { ResponsiveIconButton } from "@/modules/products/components/ResponsiveIconButton";
import { getAttributeValueLabel } from "@/modules/products/mappers/product-attributes.mapper";
import type { ProductAttributeRowState } from "@/modules/products/hooks/useProductAttributesPanel";

type ProductAttributeRowProps = {
  row: ProductAttributeRowState;
  disabled: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onSetAttribute: (rowKey: string, attributeId: number) => void;
  onRemoveAttribute: (rowKey: string) => void;
  onRemoveValueFromRow: (rowKey: string, valueId: number) => void;
  onAddPickerToRow: (rowKey: string) => void;
  onSelectPickerValue: (rowKey: string, pickerId: string, nextValueId: number) => void;
};

function TrashIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block ${className}`}
      style={{
        WebkitMaskImage: "url(/icons/trash.svg)",
        maskImage: "url(/icons/trash.svg)",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        backgroundColor: "currentColor",
      }}
    />
  );
}

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

export function ProductAttributeRow({
  row,
  disabled,
  canEdit,
  canDelete,
  onSetAttribute,
  onRemoveAttribute,
  onRemoveValueFromRow,
  onAddPickerToRow,
  onSelectPickerValue,
}: ProductAttributeRowProps) {
  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(240px,280px)_1fr_auto] lg:items-stretch">
        <div className="flex flex-col gap-2">
          <label className="block text-sm font-medium text-[var(--foreground-strong)]">
            {row.attributeLabel}
          </label>
          <select
            value={row.draft.atributoCatalogoId || ""}
            onChange={(event) => onSetAttribute(row.draft.key, Number(event.target.value))}
            disabled={disabled || !canEdit}
            className="app-input h-11 w-full rounded-xl px-4 py-2.5 text-sm"
          >
            <option value="">Selecciona un atributo</option>
            {row.attributeOptions.map((catalog) => (
              <option key={catalog.id} value={catalog.id}>
                {catalog.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="block text-sm font-medium text-[var(--foreground-strong)]">
            Valores
          </label>

          <div className="flex min-h-11 flex-wrap items-center gap-2 rounded-xl border border-[var(--line)]/70 bg-[var(--panel-muted)] px-3 py-2 sm:px-3.5">
            <div className="flex flex-1 flex-wrap items-center gap-2">
              {row.selectedValues.map((selectedValue) => (
                <span
                  key={selectedValue.id}
                  className="inline-flex min-h-8 shrink-0 items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--panel-muted)] px-3 py-1 text-sm text-[var(--foreground-strong)]"
                >
                  <span>{getAttributeValueLabel(selectedValue)}</span>
                  {canEdit ? (
                    <button
                      type="button"
                      className="inline-flex h-5 w-5 items-center justify-center rounded-full text-red-500 transition hover:bg-red-100 hover:text-red-700"
                      onClick={() => onRemoveValueFromRow(row.draft.key, selectedValue.id)}
                      aria-label={`Eliminar valor ${getAttributeValueLabel(selectedValue)}`}
                      title={`Eliminar valor ${getAttributeValueLabel(selectedValue)}`}
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                </span>
              ))}

              {row.canRenderValuePicker
                ? row.valuePickers.map((picker) => (
                    <select
                      key={picker.id}
                      value={picker.selectedValueId}
                      onChange={(event) =>
                        onSelectPickerValue(
                          row.draft.key,
                          picker.id,
                          Number(event.target.value),
                        )
                      }
                      disabled={
                        disabled ||
                        !row.draft.atributoCatalogoId ||
                        row.loadingValues ||
                        row.selectableValues.length === 0
                      }
                      className="app-input h-8 min-w-[140px] shrink-0 rounded-full px-3 py-1 text-sm"
                    >
                      <option value="">
                        {row.loadingValues ? "Cargando..." : "Seleccione"}
                      </option>
                      {row.selectableValues.map((catalogValue) => (
                        <option key={catalogValue.id} value={catalogValue.id}>
                          {getAttributeValueLabel(catalogValue)}
                        </option>
                      ))}
                    </select>
                  ))
                : null}

              {row.canAddAnotherValue ? (
                <ResponsiveIconButton
                  type="button"
                  disabled={disabled}
                  onClick={() => onAddPickerToRow(row.draft.key)}
                  className="inline-flex h-8 shrink-0 items-center gap-2 rounded-full border border-dashed border-[var(--line-strong)] px-3 text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--accent-soft)] disabled:opacity-60"
                  icon={<PlusIcon />}
                  label="Agregar valor"
                />
              ) : null}
            </div>
          </div>
        </div>

        {canDelete ? (
          <button
            type="button"
            onClick={() => onRemoveAttribute(row.draft.key)}
            disabled={disabled}
            className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-red-200/80 bg-red-50/70 text-red-600 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-100 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/70 disabled:translate-y-0 disabled:opacity-60 lg:w-11 lg:self-end"
            aria-label="Eliminar atributo"
            title="Eliminar atributo"
          >
            <TrashIcon />
          </button>
        ) : null}
      </div>
    </div>
  );
}
