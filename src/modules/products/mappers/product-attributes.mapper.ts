"use client";

import type { AttributeCatalogValue } from "@/modules/products/services/product-service";

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
