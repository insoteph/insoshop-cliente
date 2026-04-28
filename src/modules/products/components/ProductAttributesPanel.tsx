"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ResponsiveIconButton } from "./ResponsiveIconButton";

import {
  fetchAttributeCatalogs,
  fetchAttributeCatalogValues,
  type AttributeCatalog,
  type AttributeCatalogValue,
} from "@/modules/products/services/product-service";

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

type ValuePickerDraft = {
  id: string;
  selectedValueId: number | "";
};

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random()}`;
}

function createDraft(initial?: Partial<ProductAttributeDraft>): ProductAttributeDraft {
  return {
    key: createId(),
    id: initial?.id,
    atributoCatalogoId: 0,
    atributoCatalogoValorIds: [],
    ...initial,
  };
}

function createValuePicker(): ValuePickerDraft {
  return {
    id: createId(),
    selectedValueId: "",
  };
}

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

export function ProductAttributesPanel({
  storeId,
  value,
  onChange,
  disabled = false,
  canEdit,
  canDelete,
}: ProductAttributesPanelProps) {
  const [catalogs, setCatalogs] = useState<AttributeCatalog[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [isCatalogLoading, setIsCatalogLoading] = useState(false);
  const [valuesByAttributeId, setValuesByAttributeId] = useState<
    Record<number, AttributeCatalogValue[]>
  >({});
  const [loadingAttributeIds, setLoadingAttributeIds] = useState<number[]>([]);
  const [pickersByRow, setPickersByRow] = useState<
    Record<string, ValuePickerDraft[]>
  >({});

  const activeCatalogs = useMemo(
    () => catalogs.filter((attribute) => attribute.estado),
    [catalogs],
  );

  const selectedAttributeIds = useMemo(
    () =>
      value
        .map((draft) => draft.atributoCatalogoId)
        .filter((attributeId) => attributeId > 0),
    [value],
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
    const nextPickers: Record<string, ValuePickerDraft[]> = {};

    value.forEach((draft) => {
      const currentPickers = pickersByRow[draft.key];

      if (currentPickers && currentPickers.length > 0) {
        nextPickers[draft.key] = currentPickers;
        return;
      }

      if (draft.atributoCatalogoId > 0) {
        nextPickers[draft.key] = [createValuePicker()];
      }
    });

    const previousKeys = Object.keys(pickersByRow);
    const nextKeys = Object.keys(nextPickers);

    if (
      previousKeys.length !== nextKeys.length ||
      previousKeys.some((key) => !nextKeys.includes(key))
    ) {
      setPickersByRow(nextPickers);
    }
  }, [pickersByRow, value]);

  useEffect(() => {
    value
      .map((draft) => draft.atributoCatalogoId)
      .filter((attributeId) => attributeId > 0)
      .forEach((attributeId) => {
        void loadValuesForAttribute(attributeId);
      });
  }, [loadValuesForAttribute, value]);

  const addAttribute = useCallback(() => {
    const nextDraft = createDraft();
    onChange([...value, nextDraft]);
    setPickersByRow((current) => ({
      ...current,
      [nextDraft.key]: [createValuePicker()],
    }));
  }, [onChange, value]);

  const removeAttribute = useCallback(
    (rowKey: string) => {
      onChange(value.filter((draft) => draft.key !== rowKey));
      setPickersByRow((current) => {
        const next = { ...current };
        delete next[rowKey];
        return next;
      });
    },
    [onChange, value],
  );

  const setAttribute = useCallback(
    (rowKey: string, attributeId: number) => {
      onChange(
        value.map((draft) =>
          draft.key === rowKey
            ? {
                ...draft,
                atributoCatalogoId: attributeId,
                atributoCatalogoValorIds: [],
              }
            : draft,
        ),
      );

      setPickersByRow((current) => ({
        ...current,
        [rowKey]: [createValuePicker()],
      }));

      if (attributeId > 0) {
        void loadValuesForAttribute(attributeId);
      }
    },
    [loadValuesForAttribute, onChange, value],
  );

  const addValueToRow = useCallback(
    (rowKey: string, valueId: number) => {
      onChange(
        value.map((draft) => {
          if (draft.key !== rowKey) {
            return draft;
          }

          if (draft.atributoCatalogoValorIds.includes(valueId)) {
            return draft;
          }

          return {
            ...draft,
            atributoCatalogoValorIds: [...draft.atributoCatalogoValorIds, valueId],
          };
        }),
      );
    },
    [onChange, value],
  );

  const addPickerToRow = useCallback((rowKey: string) => {
    setPickersByRow((current) => ({
      ...current,
      [rowKey]: [...(current[rowKey] ?? [createValuePicker()]), createValuePicker()],
    }));
  }, []);

  const removeValueFromRow = useCallback(
    (rowKey: string, valueId: number) => {
      onChange(
        value.map((draft) =>
          draft.key === rowKey
            ? {
                ...draft,
                atributoCatalogoValorIds: draft.atributoCatalogoValorIds.filter(
                  (currentValueId) => currentValueId !== valueId,
                ),
              }
            : draft,
        ),
      );
    },
    [onChange, value],
  );

  return (
    <section className="space-y-4 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-3 shadow-sm sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-base font-semibold text-[var(--foreground-strong)] sm:text-lg">
          Atributos y valores
        </h4>

        {canEdit ? (
                <ResponsiveIconButton
                  type="button"
                  disabled={disabled || isCatalogLoading}
                  onClick={addAttribute}
                  className="app-button-primary inline-flex h-9 items-center gap-2 rounded-xl px-3 text-sm font-semibold disabled:opacity-60 sm:h-10 sm:px-3.5"
                  icon={<PlusIcon />}
                  label="Agregar atributo"
                >
                </ResponsiveIconButton>
        ) : null}
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

      <div className="space-y-3">
        {value.map((draft) => {
          const availableValues = valuesByAttributeId[draft.atributoCatalogoId] ?? [];
          const selectedValues = draft.atributoCatalogoValorIds
            .map((valueId) =>
              availableValues.find((attributeValue) => attributeValue.id === valueId),
            )
            .filter((item): item is AttributeCatalogValue => Boolean(item));

          const attributeOptions = activeCatalogs.filter(
            (catalog) =>
              catalog.id === draft.atributoCatalogoId ||
              !selectedAttributeIds.includes(catalog.id),
          );

          const valuePickers =
            pickersByRow[draft.key] ??
            (draft.atributoCatalogoId > 0 ? [createValuePicker()] : []);

          const loadingValues = loadingAttributeIds.includes(draft.atributoCatalogoId);
          const selectableValues = availableValues.filter(
            (attributeValue) =>
              !draft.atributoCatalogoValorIds.includes(attributeValue.id),
          );

          return (
            <article
              key={draft.key}
              className="rounded-2xl border border-[var(--line)]/70 bg-[var(--panel)] p-4 shadow-sm"
            >
              <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(240px,280px)_1fr_auto] lg:items-stretch">
                <div className="flex flex-col gap-2">
                  <label className="block text-sm font-medium text-[var(--foreground-strong)]">
                    Atributo
                  </label>
                  <select
                    value={draft.atributoCatalogoId || ""}
                    onChange={(event) =>
                      setAttribute(draft.key, Number(event.target.value))
                    }
                    disabled={disabled || !canEdit}
                    className="app-input h-11 w-full rounded-xl px-4 py-2.5 text-sm"
                  >
                    <option value="">Selecciona un atributo</option>
                    {attributeOptions.map((catalog) => (
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
                      {selectedValues.map((selectedValue) => (
                        <span
                          key={selectedValue.id}
                          className="inline-flex min-h-8 shrink-0 items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--panel-muted)] px-3 py-1 text-sm text-[var(--foreground-strong)]"
                        >
                          <span>{getValueLabel(selectedValue)}</span>
                          {canEdit ? (
                            <button
                              type="button"
                              className="inline-flex h-5 w-5 items-center justify-center rounded-full text-red-500 transition hover:bg-red-100 hover:text-red-700"
                              onClick={() => removeValueFromRow(draft.key, selectedValue.id)}
                              aria-label={`Eliminar valor ${getValueLabel(selectedValue)}`}
                              title={`Eliminar valor ${getValueLabel(selectedValue)}`}
                            >
                              <TrashIcon className="h-3.5 w-3.5" />
                            </button>
                          ) : null}
                        </span>
                      ))}

                      {canEdit
                        ? valuePickers.map((picker) => (
                            <select
                              key={picker.id}
                              value={picker.selectedValueId}
                              onChange={(event) => {
                                const nextValueId = Number(event.target.value);

                                setPickersByRow((current) => ({
                                  ...current,
                                  [draft.key]: (current[draft.key] ?? [picker]).map(
                                    (rowPicker) =>
                                      rowPicker.id === picker.id
                                        ? { ...rowPicker, selectedValueId: "" }
                                        : rowPicker,
                                  ),
                                }));

                                if (nextValueId) {
                                  addValueToRow(draft.key, nextValueId);
                                }
                              }}
                              disabled={
                                disabled ||
                                !draft.atributoCatalogoId ||
                                loadingValues ||
                                selectableValues.length === 0
                              }
                              className="app-input h-8 min-w-[140px] shrink-0 rounded-full px-3 py-1 text-sm"
                            >
                              <option value="">
                                {loadingValues
                                  ? "Cargando..."
                                  : selectableValues.length > 0
                                    ? "Seleccione"
                                    : "Sin valores"}
                              </option>
                              {selectableValues.map((catalogValue) => (
                                <option key={catalogValue.id} value={catalogValue.id}>
                                  {getValueLabel(catalogValue)}
                                </option>
                              ))}
                            </select>
                          ))
                        : null}

                      {canEdit &&
                      draft.atributoCatalogoId > 0 &&
                      selectableValues.length > 0 ? (
                  <ResponsiveIconButton
                    type="button"
                    disabled={disabled}
                    onClick={() => addPickerToRow(draft.key)}
                    className="inline-flex h-8 shrink-0 items-center gap-2 rounded-full border border-dashed border-[var(--line-strong)] px-3 text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--accent-soft)] disabled:opacity-60"
                    icon={<PlusIcon />}
                    label="Agregar valor"
                  >
                  </ResponsiveIconButton>
                      ) : null}
                    </div>
                  </div>
                </div>

                {canDelete ? (
                  <button
                    type="button"
                    onClick={() => removeAttribute(draft.key)}
                    disabled={disabled}
                    className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-red-200/80 bg-red-50/70 text-red-600 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-100 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/70 disabled:translate-y-0 disabled:opacity-60 lg:w-11 lg:self-end"
                    aria-label="Eliminar atributo"
                    title="Eliminar atributo"
                  >
                    <TrashIcon />
                  </button>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
