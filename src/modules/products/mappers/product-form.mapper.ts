"use client";

import type {
  ProductAttribute,
  ProductVariant,
} from "@/modules/products/services/product-service";
import type { ProductAttributeDraft } from "@/modules/products/components/ProductAttributesPanel";
import type { ProductVariantDraft } from "@/modules/products/services/product-service";

function createVariantDraftKey() {
  return (
    globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random()}`
  );
}

export function mapProductAttributesToDrafts(
  attributes: ProductAttribute[],
): ProductAttributeDraft[] {
  return attributes.map((attribute) => ({
    key:
      globalThis.crypto?.randomUUID?.() ??
      `id-${attribute.id}-${attribute.atributoCatalogoId}-${Date.now()}`,
    id: attribute.id,
    atributoCatalogoId: attribute.atributoCatalogoId,
    atributoCatalogoValorIds: attribute.valores
      .map((value) => value.atributoCatalogoValorId)
      .filter((valueId) => valueId > 0),
  }));
}

export function mapProductVariantsToDrafts(
  variants: ProductVariant[],
  attributes: ProductAttribute[],
): ProductVariantDraft[] {
  const productAttributeById = new Map(
    attributes.map((attribute) => [attribute.id, attribute.atributoCatalogoId]),
  );

  return variants.map((variant) => ({
    key: createVariantDraftKey(),
    id: variant.id,
    precio: String(variant.precio ?? ""),
    cantidad: String(variant.cantidad ?? ""),
    estado: variant.estado,
    urlImagen: variant.urlImagenPrincipal?.trim() || null,
    valoresPorAtributo: variant.valores.reduce<Record<number, string>>(
      (result, value) => {
        const attributeId = productAttributeById.get(value.productoAtributoId);
        if (attributeId && attributeId > 0) {
          result[attributeId] = String(value.atributoCatalogoValorId);
        }

        return result;
      },
      {},
    ),
  }));
}

export function alignVariantDraftsWithAttributes(
  variants: ProductVariantDraft[],
  attributes: ProductAttributeDraft[],
) {
  const activeAttributeIds = attributes
    .map((attribute) => attribute.atributoCatalogoId)
    .filter((attributeId) => attributeId > 0);

  return variants.map((variant) => {
    const nextValues: Record<number, string> = {};

    activeAttributeIds.forEach((attributeId) => {
      nextValues[attributeId] = variant.valoresPorAtributo[attributeId] ?? "";
    });

    return {
      ...variant,
      valoresPorAtributo: nextValues,
    };
  });
}

export function buildVariantPayload(
  variant: ProductVariantDraft,
  attributes: ProductAttributeDraft[],
  persistedAttributes: ProductAttribute[],
) {
  const attributeIds = attributes
    .map((attribute) => attribute.atributoCatalogoId)
    .filter((attributeId) => attributeId > 0);
  const persistedAttributeByCatalogId = new Map(
    persistedAttributes.map((attribute) => [
      attribute.atributoCatalogoId,
      attribute,
    ]),
  );

  const selectedValues: number[] = [];
  const valuesByAttribute = new Map(
    Object.entries(variant.valoresPorAtributo).map(([key, value]) => [
      Number(key),
      value,
    ]),
  );

  attributeIds.forEach((attributeId) => {
    const valueId = Number(valuesByAttribute.get(attributeId) || 0);
    const persistedAttribute = persistedAttributeByCatalogId.get(attributeId);
    const persistedValue = persistedAttribute?.valores.find(
      (value) => value.atributoCatalogoValorId === valueId,
    );

    if (persistedValue && persistedValue.id > 0) {
      selectedValues.push(persistedValue.id);
    }
  });

  return {
    precio: Number(variant.precio),
    cantidad: Number(variant.cantidad),
    estado: variant.estado,
    urlImagen: variant.urlImagen?.trim() || null,
    productoAtributoValorIds: selectedValues,
  };
}

export function validateVariantDrafts(
  variants: ProductVariantDraft[],
  attributes: ProductAttributeDraft[],
) {
  const activeAttributes = attributes.filter(
    (attribute) => attribute.atributoCatalogoId > 0,
  );

  if (activeAttributes.length === 0) {
    return variants.length > 0
      ? "Debes agregar atributos antes de definir variantes."
      : null;
  }

  if (variants.length === 0) {
    return "Debes agregar al menos una variante.";
  }

  const duplicateChecker = new Set<string>();

  for (const variant of variants) {
    const precio = Number(variant.precio);
    const cantidad = Number(variant.cantidad);

    if (!Number.isFinite(precio) || precio <= 0) {
      return "Cada variante debe tener un precio mayor que cero.";
    }

    if (!Number.isInteger(cantidad) || cantidad < 0) {
      return "Cada variante debe tener una cantidad valida.";
    }

    const values: number[] = [];

    for (const attribute of activeAttributes) {
      const valueId = Number(
        variant.valoresPorAtributo[attribute.atributoCatalogoId] || 0,
      );
      if (!valueId) {
        return "Cada variante debe contener un valor para cada atributo.";
      }

      values.push(valueId);
    }

    const signature = values.join("|");
    if (duplicateChecker.has(signature)) {
      return "No puedes repetir la misma combinacion de atributos.";
    }

    duplicateChecker.add(signature);
  }

  return null;
}

export function extractCreatedProductId(data: unknown): number | null {
  if (typeof data === "number" && Number.isFinite(data)) {
    return data;
  }

  if (typeof data === "object" && data !== null) {
    const candidate = data as Record<string, unknown>;
    const keys = ["id", "productoId", "productId"];

    for (const key of keys) {
      const value = candidate[key];
      if (typeof value === "number" && Number.isFinite(value)) {
        return value;
      }
    }

    if ("data" in candidate) {
      return extractCreatedProductId(candidate.data);
    }
  }

  return null;
}

export function buildVariantSelectionMap(
  product: { atributos: ProductAttribute[] },
  variant: ProductVariant,
) {
  return variant.valores.reduce<Record<number, number>>((accumulator, value) => {
    const productAttribute = product.atributos.find(
      (attribute) => attribute.id === value.productoAtributoId,
    );
    const attributeValue = productAttribute?.valores.find(
      (item) => item.atributoCatalogoValorId === value.atributoCatalogoValorId,
    );

    if (productAttribute && attributeValue) {
      accumulator[productAttribute.id] = attributeValue.id;
    }

    return accumulator;
  }, {});
}

export function buildVariantSelectionKey(
  product: { atributos: ProductAttribute[] },
  variant: ProductVariant,
) {
  const selectionMap = buildVariantSelectionMap(product, variant);

  return product.atributos
    .map((attribute) => selectionMap[attribute.id])
    .filter((valueId): valueId is number => Number.isInteger(valueId))
    .sort((firstValue, secondValue) => firstValue - secondValue)
    .join("|");
}

export function buildSelectedValuesKey(valueIds: number[]) {
  return [...valueIds]
    .sort((firstValue, secondValue) => firstValue - secondValue)
    .join("|");
}

export function formatVariantValues(variant: ProductVariant) {
  return variant.valores.map((value) => value.valor).join(" / ");
}
