"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  fetchAttributeCatalogs,
  fetchAttributeCatalogValues,
  uploadProductImage,
  type AttributeCatalog,
  type AttributeCatalogValue,
  type ProductVariantDraft,
} from "@/modules/products/services/product-service";
import type { ProductAttributeDraft } from "@/modules/products/components/ProductAttributesPanel";

type ProductVariantsPanelProps = {
  storeId: number;
  attributes: ProductAttributeDraft[];
  value: ProductVariantDraft[];
  onChange: (value: ProductVariantDraft[]) => void;
  disabled?: boolean;
  canEdit: boolean;
  canDelete: boolean;
};

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random()}`;
}

function createVariantDraft(
  attributes: ProductAttributeDraft[],
): ProductVariantDraft {
  const valoresPorAtributo: Record<number, string> = {};

  attributes.forEach((attribute) => {
    if (attribute.atributoCatalogoId > 0) {
      valoresPorAtributo[attribute.atributoCatalogoId] = "";
    }
  });

  return {
    key: createId(),
    precio: "",
    cantidad: "",
    estado: true,
    urlImagen: null,
    valoresPorAtributo,
  };
}

function normalizeValueList(values: unknown): AttributeCatalogValue[] {
  if (Array.isArray(values)) {
    return values as AttributeCatalogValue[];
  }

  if (
    typeof values === "object" &&
    values !== null &&
    "items" in values &&
    Array.isArray((values as { items?: unknown[] }).items)
  ) {
    return (values as { items: AttributeCatalogValue[] }).items;
  }

  return [];
}

function getValueLabel(value: AttributeCatalogValue) {
  return value.nombre ?? value.valor ?? `Valor ${value.id}`;
}

function ImageIcon() {
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
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="m21 16-5-5-4 4-2-2-5 5" />
    </svg>
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

function TrashIcon() {
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
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

function formatVariantPrice(value: string) {
  return value.trim();
}

function VariantImagePicker({
  value,
  onChange,
  disabled,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
  disabled: boolean;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const preview = value?.trim() ? value.trim() : null;

  const handleUpload = useCallback(async () => {
    const file = inputRef.current?.files?.[0];
    if (!file) {
      return;
    }

    setIsUploading(true);
    setFeedback(null);

    try {
      const uploaded = await uploadProductImage(file);
      onChange(uploaded.url);
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "No se pudo subir la imagen de la variante.",
      );
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }, [onChange]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || isUploading}
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] px-3 py-2 text-xs font-semibold text-[var(--foreground)] transition hover:bg-[var(--panel-muted)] disabled:opacity-60"
        >
          <ImageIcon />
          <span>{isUploading ? "Subiendo..." : "Subir"}</span>
        </button>
        {preview ? (
          <button
            type="button"
            onClick={() => onChange(null)}
            disabled={disabled || isUploading}
            className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
          >
            Quitar
          </button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleUpload}
        className="sr-only"
      />

      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Imagen de la variante"
          className="h-16 w-16 rounded-xl object-cover ring-1 ring-[var(--line)]"
        />
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--line)] px-3 py-2 text-xs text-[var(--muted)]">
          Opcional
        </div>
      )}

      {feedback ? <p className="text-xs text-red-600">{feedback}</p> : null}
    </div>
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
  const [catalogs, setCatalogs] = useState<AttributeCatalog[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [isCatalogLoading, setIsCatalogLoading] = useState(false);
  const [valuesByAttributeId, setValuesByAttributeId] = useState<
    Record<number, AttributeCatalogValue[]>
  >({});
  const [loadingAttributeIds, setLoadingAttributeIds] = useState<number[]>([]);

  const activeAttributes = useMemo(
    () => attributes.filter((attribute) => attribute.atributoCatalogoId > 0),
    [attributes],
  );

  const loadCatalogs = useCallback(async () => {
    setIsCatalogLoading(true);
    setCatalogError(null);

    try {
      const result = await fetchAttributeCatalogs(storeId);
      setCatalogs(result);
    } catch (error) {
      setCatalogError(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los atributos del catalogo.",
      );
      setCatalogs([]);
    } finally {
      setIsCatalogLoading(false);
    }
  }, [storeId]);

  const loadValuesForAttribute = useCallback(
    async (attributeId: number) => {
      if (!attributeId || valuesByAttributeId[attributeId]) {
        return;
      }

      setLoadingAttributeIds((current) =>
        current.includes(attributeId) ? current : [...current, attributeId],
      );

      try {
        const result = await fetchAttributeCatalogValues(storeId, attributeId);
        setValuesByAttributeId((current) => ({
          ...current,
          [attributeId]: normalizeValueList(result),
        }));
      } catch {
        setValuesByAttributeId((current) => ({
          ...current,
          [attributeId]: [],
        }));
      } finally {
        setLoadingAttributeIds((current) =>
          current.filter((currentId) => currentId !== attributeId),
        );
      }
    },
    [storeId, valuesByAttributeId],
  );

  useEffect(() => {
    void loadCatalogs();
  }, [loadCatalogs]);

  useEffect(() => {
    activeAttributes.forEach((attribute) => {
      void loadValuesForAttribute(attribute.atributoCatalogoId);
    });
  }, [activeAttributes, loadValuesForAttribute]);

  const attributeInfoById = useMemo(() => {
    const catalogById = new Map(catalogs.map((catalog) => [catalog.id, catalog]));

    return activeAttributes.map((attribute, index) => {
      const catalog = catalogById.get(attribute.atributoCatalogoId);
      const allValues = valuesByAttributeId[attribute.atributoCatalogoId] ?? [];
      const allowedValueIds = new Set(attribute.atributoCatalogoValorIds);
      const allowedValues = allValues.filter((item) => allowedValueIds.has(item.id));

      return {
        attribute,
        label: catalog?.nombre ?? `Atributo ${index + 1}`,
        loading: loadingAttributeIds.includes(attribute.atributoCatalogoId),
        values: allowedValues,
      };
    });
  }, [activeAttributes, catalogs, loadingAttributeIds, valuesByAttributeId]);

  const hasMissingAttributeValues = attributeInfoById.some(
    (attribute) => attribute.values.length === 0,
  );
  const canBuildVariants =
    activeAttributes.length > 0 && !hasMissingAttributeValues;

  const addVariant = useCallback(() => {
    onChange([...value, createVariantDraft(attributes)]);
  }, [attributes, onChange, value]);

  const removeVariant = useCallback(
    (rowKey: string) => {
      onChange(value.filter((draft) => draft.key !== rowKey));
    },
    [onChange, value],
  );

  const updateVariant = useCallback(
    (rowKey: string, patch: Partial<ProductVariantDraft>) => {
      onChange(
        value.map((draft) =>
          draft.key === rowKey
            ? {
                ...draft,
                ...patch,
              }
            : draft,
        ),
      );
    },
    [onChange, value],
  );

  return (
    <section className="space-y-4 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-lg font-semibold text-[var(--foreground-strong)]">
            Variantes
          </h4>
          <p className="text-sm text-[var(--muted)]">
            Define manual y explicitamente cada combinacion de atributos.
            La imagen por variante es opcional y solo se guarda una.
          </p>
        </div>

        {canEdit ? (
          <button
            type="button"
            disabled={
              disabled ||
              isCatalogLoading ||
              !canBuildVariants
            }
            onClick={addVariant}
            className="app-button-primary inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-60"
          >
            <PlusIcon />
            <span>Agregar variante</span>
          </button>
        ) : null}
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
          Uno o más atributos no tienen valores seleccionables. Completa esos
          valores antes de crear variantes.
        </div>
      ) : null}

      {value.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-[var(--line)]/70">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-[var(--panel-muted)] text-left text-[var(--foreground-strong)]">
              <tr>
                {attributeInfoById.map((attribute) => (
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
                  {attributeInfoById.map((attribute) => {
                    const selectedValueId = draft.valoresPorAtributo[attribute.attribute.atributoCatalogoId] ?? "";

                    return (
                      <td key={attribute.attribute.atributoCatalogoId} className="px-4 py-3">
                        {canEdit ? (
                          <select
                            value={selectedValueId}
                            onChange={(event) =>
                              updateVariant(draft.key, {
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
                                {getValueLabel(attributeValue)}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-[var(--foreground-strong)]">
                            {attribute.values.find(
                              (attributeValue) =>
                                attributeValue.id === Number(selectedValueId || 0),
                            )?.nombre ??
                              attribute.values.find(
                                (attributeValue) =>
                                  attributeValue.id === Number(selectedValueId || 0),
                              )?.valor ??
                              "Sin seleccionar"}
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
                          updateVariant(draft.key, { precio: event.target.value })
                        }
                        disabled={disabled}
                        className="app-input w-full min-w-[120px] rounded-xl px-3 py-2.5 text-sm"
                      />
                    ) : (
                      <span>{formatVariantPrice(draft.precio)}</span>
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
                          updateVariant(draft.key, { cantidad: event.target.value })
                        }
                        disabled={disabled}
                        className="app-input w-full min-w-[110px] rounded-xl px-3 py-2.5 text-sm"
                      />
                    ) : (
                      <span>{draft.cantidad}</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <VariantImagePicker
                      value={draft.urlImagen}
                      onChange={(nextImage) =>
                        updateVariant(draft.key, { urlImagen: nextImage })
                      }
                      disabled={disabled || !canEdit}
                    />
                  </td>

                  <td className="px-4 py-3">
                    {canEdit ? (
                      <label className="inline-flex items-center gap-2 text-sm text-[var(--foreground)]">
                        <input
                          type="checkbox"
                          checked={draft.estado}
                          onChange={(event) =>
                            updateVariant(draft.key, { estado: event.target.checked })
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
                        onClick={() => removeVariant(draft.key)}
                        disabled={disabled}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                      >
                        <TrashIcon />
                        <span>Eliminar</span>
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
