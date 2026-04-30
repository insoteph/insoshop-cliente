"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  fetchAttributeCatalogs,
  fetchAttributeCatalogValues,
  type AttributeCatalog,
  type AttributeCatalogValue,
  type ProductVariantDraft,
} from "@/modules/products/services/product-service";
import type { ProductAttributeDraft } from "@/modules/products/components/ProductAttributesPanel";
import {
  buildVariantAttributeInfo,
  normalizeAttributeValues,
  type ProductVariantDraftInfo,
} from "@/modules/products/mappers/product-variants.mapper";

type UseProductVariantsPanelParams = {
  storeId: number;
  attributes: ProductAttributeDraft[];
  value: ProductVariantDraft[];
  onChange: (value: ProductVariantDraft[]) => void;
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

export function useProductVariantsPanel({
  storeId,
  attributes,
  value,
  onChange,
}: UseProductVariantsPanelParams) {
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
    activeAttributes.forEach((attribute) => {
      void loadValuesForAttribute(attribute.atributoCatalogoId);
    });
  }, [activeAttributes, loadValuesForAttribute]);

  const attributeInfoById: ProductVariantDraftInfo[] = useMemo(
    () =>
      buildVariantAttributeInfo(
        activeAttributes,
        catalogs,
        valuesByAttributeId,
        loadingAttributeIds,
      ),
    [activeAttributes, catalogs, loadingAttributeIds, valuesByAttributeId],
  );

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

  return {
    activeAttributes,
    attributeInfoById,
    canBuildVariants,
    catalogError,
    hasMissingAttributeValues,
    isCatalogLoading,
    addVariant,
    removeVariant,
    updateVariant,
  };
}
