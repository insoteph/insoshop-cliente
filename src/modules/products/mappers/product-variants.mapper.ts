"use client";

import type {
  AttributeCatalog,
  AttributeCatalogValue,
} from "@/modules/products/services/product-service";
import type { ProductAttributeDraft } from "@/modules/products/components/ProductAttributesPanel";

export type ProductVariantDraftInfo = {
  attribute: ProductAttributeDraft;
  label: string;
  loading: boolean;
  values: AttributeCatalogValue[];
};

export function normalizeAttributeValues(values: unknown): AttributeCatalogValue[] {
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

export function getAttributeValueLabel(value: AttributeCatalogValue) {
  return value.nombre ?? value.valor ?? `Valor ${value.id}`;
}

export function buildVariantAttributeInfo(
  attributes: ProductAttributeDraft[],
  catalogs: AttributeCatalog[],
  valuesByAttributeId: Record<number, AttributeCatalogValue[]>,
  loadingAttributeIds: number[],
) {
  const catalogById = new Map(catalogs.map((catalog) => [catalog.id, catalog]));

  return attributes
    .filter((attribute) => attribute.atributoCatalogoId > 0)
    .map((attribute, index) => {
      const catalog = catalogById.get(attribute.atributoCatalogoId);
      const allValues = valuesByAttributeId[attribute.atributoCatalogoId] ?? [];
      const allowedValueIds = new Set(attribute.atributoCatalogoValorIds);
      const allowedValues = allValues.filter((item) => allowedValueIds.has(item.id));

      return {
        attribute,
        label: catalog?.nombre ?? `Atributo ${index + 1}`,
        loading: loadingAttributeIds.includes(attribute.atributoCatalogoId),
        values: allowedValues,
      } satisfies ProductVariantDraftInfo;
    });
}
