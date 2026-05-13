"use client";

import { useState } from "react";

import { AppButton } from "@/modules/core/components/AppButton";
import { formatCurrency } from "@/modules/core/lib/formatters";
import { ProductVariantsImagePicker } from "@/modules/products/components/ProductVariantsImagePicker";
import {
  getAttributeValueLabel,
  type ProductVariantDraftInfo,
} from "@/modules/products/mappers/product-variants.mapper";
import type { ProductVariantDraft } from "@/modules/products/services/product-service";

type ProductVariantsListProps = {
  variants: ProductVariantDraftInfo[];
  value: ProductVariantDraft[];
  currency?: string;
  canEdit: boolean;
  canDelete: boolean;
  disabled: boolean;
  canBuildVariants: boolean;
  isCatalogLoading: boolean;
  onAddVariant: () => string;
  onRemove: (rowKey: string) => void;
  onUpdateVariant: (rowKey: string, patch: Partial<ProductVariantDraft>) => void;
};

function TrashIcon() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-4 w-4"
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

function getSelectedLabel(
  attribute: ProductVariantDraftInfo,
  selectedValueId: string,
) {
  return (
    attribute.values.find(
      (attributeValue) => attributeValue.id === Number(selectedValueId || 0),
    )?.nombre ??
    attribute.values.find(
      (attributeValue) => attributeValue.id === Number(selectedValueId || 0),
    )?.valor ??
    "Sin seleccionar"
  );
}

export function ProductVariantsList({
  variants,
  value,
  currency,
  canEdit,
  canDelete,
  disabled,
  canBuildVariants,
  isCatalogLoading,
  onAddVariant,
  onRemove,
  onUpdateVariant,
}: ProductVariantsListProps) {
  const [expandedVariantKey, setExpandedVariantKey] = useState<string | null>(
    null,
  );

  const handleAddVariant = () => {
    const newVariantKey = onAddVariant();
    setExpandedVariantKey(newVariantKey);
  };

  const renderVariantFields = (draft: ProductVariantDraft, expanded: boolean) => (
    <div
      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
        expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      }`}
      aria-hidden={!expanded}
    >
      <div className="overflow-hidden border-t border-[var(--line)] px-4 py-4">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {variants.map((attribute) => {
              const selectedValueId =
                draft.valoresPorAtributo[attribute.attribute.atributoCatalogoId] ?? "";

              return (
                <label
                  key={`${draft.key}-${attribute.attribute.atributoCatalogoId}`}
                  className="grid gap-2"
                >
                  <span className="text-sm font-medium text-[var(--foreground-strong)]">
                    {attribute.label}
                  </span>
                  <select
                    value={selectedValueId}
                    onChange={(event) =>
                      onUpdateVariant(draft.key, {
                        valoresPorAtributo: {
                          ...draft.valoresPorAtributo,
                          [attribute.attribute.atributoCatalogoId]: event.target.value,
                        },
                      })
                    }
                    disabled={
                      disabled ||
                      !attribute.attribute.atributoCatalogoId ||
                      attribute.loading ||
                      attribute.values.length === 0
                    }
                    className="app-input w-full rounded-xl px-3 py-2.5 text-sm"
                  >
                    <option value="">
                      {attribute.loading
                        ? "Cargando..."
                        : attribute.values.length > 0
                          ? "Selecciona"
                          : "Sin valores"}
                    </option>
                    {attribute.values.map((attributeValue) => (
                      <option key={attributeValue.id} value={attributeValue.id}>
                        {getAttributeValueLabel(attributeValue)}
                      </option>
                    ))}
                  </select>
                </label>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--foreground-strong)]">
                Precio
              </span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={draft.precio}
                onChange={(event) =>
                  onUpdateVariant(draft.key, { precio: event.target.value })
                }
                disabled={disabled}
                className="app-input w-full rounded-xl px-3 py-2.5 text-sm"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--foreground-strong)]">
                Stock
              </span>
              <input
                type="number"
                min="0"
                step="1"
                value={draft.cantidad}
                onChange={(event) =>
                  onUpdateVariant(draft.key, { cantidad: event.target.value })
                }
                disabled={disabled}
                className="app-input w-full rounded-xl px-3 py-2.5 text-sm"
              />
            </label>
          </div>

          {canEdit ? (
            <label className="flex items-center gap-3 rounded-2xl border border-[var(--line)]/70 bg-[var(--panel-muted)] px-4 py-3 text-sm text-[var(--foreground)]">
              <input
                type="checkbox"
                checked={draft.estado}
                onChange={(event) =>
                  onUpdateVariant(draft.key, { estado: event.target.checked })
                }
                disabled={disabled}
              />
              Combinación activa
            </label>
          ) : null}

          <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--panel-muted)] p-3">
            <ProductVariantsImagePicker
              value={draft.urlImagen}
              onChange={(nextImage) =>
                onUpdateVariant(draft.key, { urlImagen: nextImage })
              }
              disabled={disabled || !canEdit}
            />
          </div>

          {canDelete ? (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => onRemove(draft.key)}
                disabled={disabled}
                className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-[color-mix(in_srgb,var(--danger)_18%,var(--line))] bg-[var(--danger-soft)] text-[var(--danger)] shadow-none transition duration-200 hover:-translate-y-0.5 hover:bg-[color-mix(in_srgb,var(--danger-soft)_72%,white)] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--danger)_28%,transparent)] disabled:translate-y-0 disabled:opacity-60 lg:w-full"
                aria-label="Eliminar variante"
                title="Eliminar variante"
              >
                <TrashIcon />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {value.length === 0 ? (
        <div className="space-y-3 rounded-2xl border border-dashed border-[var(--line)] bg-[var(--panel-muted)] px-4 py-5">
          <p className="text-sm text-[var(--muted)]">
            Todavía no hay variantes creadas.
          </p>
          {canEdit ? (
            <div className="flex justify-start">
              <AppButton
                iconPath="/icons/plus-circle.svg"
                disabled={disabled || isCatalogLoading || !canBuildVariants}
                onClick={handleAddVariant}
              >
                Agregar variante
              </AppButton>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="space-y-3">
          {value.map((draft, index) => {
            const isExpanded = expandedVariantKey === draft.key;
            const title = `Variante ${index + 1}`;
            const selectedLabels = variants
              .map((attribute) => {
                const selectedValueId =
                  draft.valoresPorAtributo[attribute.attribute.atributoCatalogoId] ?? "";
                const selectedLabel = getSelectedLabel(attribute, selectedValueId);

                return `${attribute.label}: ${selectedLabel}`;
              })
              .join(" • ");

            return (
            <article
              key={draft.key}
              className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)] shadow-sm transition-shadow"
            >
              <button
                type="button"
                className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left"
                onClick={() =>
                  setExpandedVariantKey(isExpanded ? null : draft.key)
                }
                aria-expanded={isExpanded}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--foreground-strong)]">
                      {title}
                    </span>
                    <span
                      className={
                        draft.estado
                          ? "rounded-lg bg-[var(--success-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--success)]"
                          : "rounded-lg bg-[var(--danger-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--danger)]"
                      }
                    >
                      {draft.estado ? "Activa" : "Inactiva"}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-sm text-[var(--muted)]">
                    {selectedLabels || "Selecciona los atributos de esta variante."}
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {currency
                      ? `Precio: ${formatCurrency(Number(draft.precio || 0), currency)}`
                      : `Precio: ${draft.precio || "-"}`}
                    {" • "}
                    Stock: {draft.cantidad || "-"}
                  </p>
                </div>

                <span
                  aria-hidden="true"
                  className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--panel-muted)] text-base leading-none transition-transform duration-200 ${
                    isExpanded ? "rotate-180" : "rotate-0"
                  }`}
                >
                    ⌄
                  </span>
                </button>

                {renderVariantFields(draft, isExpanded)}
              </article>
            );
          })}
        </div>
      )}

      {value.length > 0 && canEdit ? (
        <div className="flex justify-end pt-1">
          <AppButton
            iconPath="/icons/plus-circle.svg"
            disabled={disabled || isCatalogLoading || !canBuildVariants}
            onClick={handleAddVariant}
          >
            Agregar variante
          </AppButton>
        </div>
      ) : null}
    </div>
  );
}
