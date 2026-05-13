"use client";

import { AppButton } from "@/modules/core/components/AppButton";
import { getAttributeValueLabel } from "@/modules/products/mappers/product-attributes.mapper";
import type { ProductAttributeRowState } from "@/modules/products/hooks/useProductAttributesPanel";

type ProductAttributeRowProps = {
  row: ProductAttributeRowState;
  expanded: boolean;
  disabled: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onToggleExpanded: () => void;
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

export function ProductAttributeRow({
  row,
  expanded,
  disabled,
  canEdit,
  canDelete,
  onToggleExpanded,
  onSetAttribute,
  onRemoveAttribute,
  onRemoveValueFromRow,
  onAddPickerToRow,
  onSelectPickerValue,
}: ProductAttributeRowProps) {
  const attributeLabel =
    row.draft.atributoCatalogoId > 0
      ? row.attributeOptions.find(
          (catalog) => catalog.id === row.draft.atributoCatalogoId,
        )?.nombre ?? row.attributeLabel
      : row.attributeLabel;

  const selectedSummary =
    row.selectedValues.length > 0
      ? row.selectedValues.map((value) => getAttributeValueLabel(value)).join(" • ")
      : "Selecciona el atributo y sus valores.";

  const statusLabel =
    row.draft.atributoCatalogoId > 0
      ? row.selectedValues.length > 0
        ? "Con valores"
        : "Sin valores"
      : "Pendiente";

  return (
    <article className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)] shadow-sm transition-shadow">
      <button
        type="button"
        className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left"
        onClick={onToggleExpanded}
        aria-expanded={expanded}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-[var(--foreground-strong)]">
              {attributeLabel}
            </span>
            <span
              className={
                row.draft.atributoCatalogoId > 0
                  ? row.selectedValues.length > 0
                    ? "rounded-lg bg-[var(--success-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--success)]"
                    : "rounded-lg bg-[var(--warning-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--warning)]"
                  : "rounded-lg bg-[var(--panel-muted)] px-2.5 py-1 text-xs font-semibold text-[var(--muted)]"
              }
            >
              {statusLabel}
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">
            {selectedSummary}
          </p>
        </div>

        <span
          aria-hidden="true"
          className={`mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--panel-muted)] text-lg leading-none transition-transform duration-200 ${
            expanded ? "rotate-180" : "rotate-0"
          }`}
        >
          ⌄
        </span>
      </button>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
        aria-hidden={!expanded}
      >
        <div className="overflow-hidden">
          <div className="space-y-4 border-t border-[var(--line)] px-4 py-4">
            <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(240px,280px)_1fr_auto] lg:items-stretch">
              <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium text-[var(--foreground-strong)]">
                  {row.attributeLabel}
                </label>
                <select
                  value={row.draft.atributoCatalogoId || ""}
                  onChange={(event) =>
                    onSetAttribute(row.draft.key, Number(event.target.value))
                  }
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
                            className="inline-flex h-5 w-5 items-center justify-center rounded-lg border border-transparent text-[var(--danger)] transition hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
                            onClick={() =>
                              onRemoveValueFromRow(row.draft.key, selectedValue.id)
                            }
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
                      <AppButton
                        iconPath="/icons/plus-circle.svg"
                        disabled={disabled}
                        onClick={() => onAddPickerToRow(row.draft.key)}
                        className="rounded-full border border-dashed border-[var(--line-strong)] bg-transparent px-3 text-[var(--accent)] shadow-none hover:bg-[var(--accent-soft)]"
                      >
                        Agregar valor
                      </AppButton>
                    ) : null}
                  </div>
                </div>
              </div>

              {canDelete ? (
                <div className="flex lg:items-end">
                  <button
                    type="button"
                    onClick={() => onRemoveAttribute(row.draft.key)}
                    disabled={disabled}
                    className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-[color-mix(in_srgb,var(--danger)_18%,var(--line))] bg-[var(--danger-soft)] text-[var(--danger)] shadow-none transition duration-200 hover:-translate-y-0.5 hover:bg-[color-mix(in_srgb,var(--danger-soft)_72%,white)] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--danger)_28%,transparent)] disabled:translate-y-0 disabled:opacity-60 lg:w-11"
                    aria-label="Eliminar atributo"
                    title="Eliminar atributo"
                  >
                    <TrashIcon />
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
