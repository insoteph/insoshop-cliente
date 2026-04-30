"use client";

import { formatCurrency } from "@/modules/core/lib/formatters";
import { ProductVariantsImagePicker } from "@/modules/products/components/ProductVariantsImagePicker";
import { getAttributeValueLabel, type ProductVariantDraftInfo } from "@/modules/products/mappers/product-variants.mapper";
import type { ProductVariantDraft } from "@/modules/products/services/product-service";

type ProductVariantsListProps = {
  variants: ProductVariantDraftInfo[];
  value: ProductVariantDraft[];
  currency?: string;
  canEdit: boolean;
  canDelete: boolean;
  disabled: boolean;
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
    attribute.values.find((attributeValue) => attributeValue.id === Number(selectedValueId || 0))
      ?.nombre ??
    attribute.values.find((attributeValue) => attributeValue.id === Number(selectedValueId || 0))
      ?.valor ??
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
  onRemove,
  onUpdateVariant,
}: ProductVariantsListProps) {
  if (value.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="divide-y divide-[var(--line)]/60 md:hidden">
        {value.map((draft, index) => (
          <div key={draft.key} className="py-4 first:pt-0 last:pb-0">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-[var(--foreground-strong)]">
                  Variante {index + 1}
                </span>
              </div>

              <div className="grid gap-3">
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

              <div className="grid gap-3">
                <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--panel-muted)] p-3">
                  <ProductVariantsImagePicker
                    value={draft.urlImagen}
                    onChange={(nextImage) =>
                      onUpdateVariant(draft.key, { urlImagen: nextImage })
                    }
                    disabled={disabled || !canEdit}
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
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
                      Existencias
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
              </div>

              {canDelete ? (
                <button
                  type="button"
                  onClick={() => onRemove(draft.key)}
                  disabled={disabled}
                  className="flex h-11 w-full items-center justify-center rounded-2xl border border-red-200/80 bg-red-50/70 text-red-600 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-100 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/70 disabled:translate-y-0 disabled:opacity-60"
                  aria-label="Eliminar variante"
                  title="Eliminar variante"
                >
                  <TrashIcon />
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-[var(--line)]/70 md:block">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-[var(--panel-muted)] text-left text-[var(--foreground-strong)]">
            <tr>
              {variants.map((attribute) => (
                <th
                  key={attribute.attribute.atributoCatalogoId}
                  className="px-4 py-3 font-semibold"
                >
                  {attribute.label}
                </th>
              ))}
              <th className="px-4 py-3 font-semibold">Precio</th>
              <th className="px-4 py-3 font-semibold">Cantidad</th>
              <th className="px-4 py-3 font-semibold">Imagen</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              {canDelete ? <th className="px-4 py-3 font-semibold">Acciones</th> : null}
            </tr>
          </thead>
          <tbody>
            {value.map((draft) => (
              <tr key={draft.key} className="border-t border-[var(--line)]/70 align-top">
                {variants.map((attribute) => {
                  const selectedValueId =
                    draft.valoresPorAtributo[attribute.attribute.atributoCatalogoId] ?? "";

                  return (
                    <td key={attribute.attribute.atributoCatalogoId} className="px-4 py-3">
                      {canEdit ? (
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
                          className="app-input w-full min-w-[180px] rounded-xl px-3 py-2.5 text-sm"
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
                      ) : (
                        <span className="text-[var(--foreground-strong)]">
                          {getSelectedLabel(attribute, selectedValueId)}
                        </span>
                      )}
                    </td>
                  );
                })}

                <td className="px-4 py-3">
                  {canEdit ? (
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={draft.precio}
                      onChange={(event) =>
                        onUpdateVariant(draft.key, { precio: event.target.value })
                      }
                      disabled={disabled}
                      className="app-input w-full min-w-[120px] rounded-xl px-3 py-2.5 text-sm"
                    />
                  ) : (
                    <span>
                      {currency ? formatCurrency(Number(draft.precio || 0), currency) : draft.precio}
                    </span>
                  )}
                </td>

                <td className="px-4 py-3">
                  {canEdit ? (
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={draft.cantidad}
                      onChange={(event) =>
                        onUpdateVariant(draft.key, { cantidad: event.target.value })
                      }
                      disabled={disabled}
                      className="app-input w-full min-w-[110px] rounded-xl px-3 py-2.5 text-sm"
                    />
                  ) : (
                    <span>{draft.cantidad}</span>
                  )}
                </td>

                <td className="px-4 py-3">
                  <ProductVariantsImagePicker
                    value={draft.urlImagen}
                    onChange={(nextImage) =>
                      onUpdateVariant(draft.key, { urlImagen: nextImage })
                    }
                    disabled={disabled || !canEdit}
                  />
                </td>

                <td className="px-4 py-3">
                  {canEdit ? (
                    <label className="inline-flex h-11 items-center gap-2 rounded-2xl border border-[var(--line)]/70 bg-[var(--panel-muted)] px-4 text-sm text-[var(--foreground)]">
                      <input
                        type="checkbox"
                        checked={draft.estado}
                        onChange={(event) =>
                          onUpdateVariant(draft.key, { estado: event.target.checked })
                        }
                        disabled={disabled}
                      />
                      Activa
                    </label>
                  ) : (
                    <span
                      className={
                        draft.estado
                          ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                          : "rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                      }
                    >
                      {draft.estado ? "Activa" : "Inactiva"}
                    </span>
                  )}
                </td>

                {canDelete ? (
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onRemove(draft.key)}
                      disabled={disabled}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-red-200/80 bg-red-50/70 text-red-600 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-100 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/70 disabled:translate-y-0 disabled:opacity-60"
                      aria-label="Eliminar variante"
                      title="Eliminar variante"
                    >
                      <TrashIcon />
                    </button>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
