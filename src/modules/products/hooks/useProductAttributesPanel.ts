"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  fetchAttributeCatalogs,
  fetchAttributeCatalogValues,
  type AttributeCatalog,
  type AttributeCatalogValue,
} from "@/modules/products/services/product-service";
import type { ProductAttributeDraft } from "@/modules/products/components/ProductAttributesPanel";
import {
  normalizeAttributeValues,
} from "@/modules/products/mappers/product-attributes.mapper";

type ValuePickerDraft = {
  id: string;
  selectedValueId: number | "";
};

export type ProductAttributeRowState = {
  draft: ProductAttributeDraft;
  attributeIndex: number;
  attributeLabel: string;
  attributeOptions: AttributeCatalog[];
  selectedValues: AttributeCatalogValue[];
  valuePickers: ValuePickerDraft[];
  loadingValues: boolean;
  selectableValues: AttributeCatalogValue[];
  canRenderValuePicker: boolean;
  canAddAnotherValue: boolean;
};

type UseProductAttributesPanelParams = {
  storeId: number;
  value: ProductAttributeDraft[];
  onChange: (value: ProductAttributeDraft[]) => void;
  disabled?: boolean;
  canEdit: boolean;
};

const MAX_ATTRIBUTES = 2;

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

export function useProductAttributesPanel({
  storeId,
  value,
  onChange,
  disabled = false,
  canEdit,
}: UseProductAttributesPanelParams) {
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

  const canAddAttribute = canEdit && value.length < MAX_ATTRIBUTES;

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
          [attributeId]: normalizeAttributeValues(result),
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
    setPickersByRow((current) => {
      let changed = false;
      const next: Record<string, ValuePickerDraft[]> = {};

      value.forEach((draft) => {
        const currentPickers = current[draft.key];

        if (currentPickers && currentPickers.length > 0) {
          next[draft.key] = currentPickers;
          return;
        }

        if (draft.atributoCatalogoId > 0) {
          next[draft.key] = [createValuePicker()];
          changed = true;
        }
      });

      const currentKeys = Object.keys(current);
      const nextKeys = Object.keys(next);

      if (
        currentKeys.length !== nextKeys.length ||
        currentKeys.some((key) => !nextKeys.includes(key))
      ) {
        changed = true;
      }

      return changed ? next : current;
    });
  }, [value]);

  useEffect(() => {
    value
      .map((draft) => draft.atributoCatalogoId)
      .filter((attributeId) => attributeId > 0)
      .forEach((attributeId) => {
        void loadValuesForAttribute(attributeId);
      });
  }, [loadValuesForAttribute, value]);

  const addAttribute = useCallback(() => {
    if (!canAddAttribute || value.length >= MAX_ATTRIBUTES) {
      return;
    }

    const nextDraft = createDraft();
    onChange([...value, nextDraft]);
    setPickersByRow((current) => ({
      ...current,
      [nextDraft.key]: [createValuePicker()],
    }));
  }, [canAddAttribute, onChange, value]);

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

  const selectPickerValue = useCallback(
    (rowKey: string, pickerId: string, nextValueId: number) => {
      setPickersByRow((current) => ({
        ...current,
        [rowKey]: (current[rowKey] ?? [createValuePicker()]).map((rowPicker) =>
          rowPicker.id === pickerId ? { ...rowPicker, selectedValueId: "" } : rowPicker,
        ),
      }));

      if (nextValueId) {
        addValueToRow(rowKey, nextValueId);
      }
    },
    [addValueToRow],
  );

  const rows = useMemo<ProductAttributeRowState[]>(
    () =>
      value.map((draft, index) => {
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
          pickersByRow[draft.key] ?? (draft.atributoCatalogoId > 0 ? [createValuePicker()] : []);

        const loadingValues = loadingAttributeIds.includes(draft.atributoCatalogoId);
        const selectableValues = availableValues.filter(
          (attributeValue) =>
            !draft.atributoCatalogoValorIds.includes(attributeValue.id),
        );
        const canRenderValuePicker = canEdit && (loadingValues || selectableValues.length > 0);
        const hasPendingValuePicker = valuePickers.some((picker) => !picker.selectedValueId);
        const canAddAnotherValue =
          canEdit &&
          selectedValues.length > 0 &&
          selectableValues.length > 0 &&
          !hasPendingValuePicker;

        return {
          draft,
          attributeIndex: index,
          attributeLabel: `Atributo ${index + 1}`,
          attributeOptions,
          selectedValues,
          valuePickers,
          loadingValues,
          selectableValues,
          canRenderValuePicker,
          canAddAnotherValue,
        };
      }),
    [
      activeCatalogs,
      canEdit,
      loadingAttributeIds,
      pickersByRow,
      selectedAttributeIds,
      value,
      valuesByAttributeId,
    ],
  );

  return {
    catalogError,
    canAddAttribute,
    disabled,
    isCatalogLoading,
    rows,
    addAttribute,
    addPickerToRow,
    removeAttribute,
    removeValueFromRow,
    selectPickerValue,
    setAttribute,
  };
}
