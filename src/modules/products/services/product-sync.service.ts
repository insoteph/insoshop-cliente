"use client";

import { buildVariantPayload } from "@/modules/products/mappers/product-form.mapper";
import type { ProductAttributeDraft } from "@/modules/products/components/ProductAttributesPanel";
import {
  createProductAttribute,
  createProductVariants,
  deleteProductAttribute,
  deleteProductVariant,
  fetchProductAttributes,
  updateProductAttribute,
  updateProductVariant,
  type ProductAttribute,
  type ProductAttributeDraftPayload,
  type ProductVariantDraft,
  type ProductVariantPayload,
} from "@/modules/products/services/product-service";

type SyncProductAttributesParams = {
  storeId: number;
  productId: number;
  attributeDrafts: ProductAttributeDraft[];
  originalAttributeIds: number[];
};

type SyncProductVariantsParams = {
  storeId: number;
  productId: number;
  attributeDrafts: ProductAttributeDraft[];
  variantDrafts: ProductVariantDraft[];
  persistedAttributes: ProductAttribute[];
  originalVariantIds: number[];
};

export async function syncProductAttributes({
  storeId,
  productId,
  attributeDrafts,
  originalAttributeIds,
}: SyncProductAttributesParams) {
  const normalizedDrafts = attributeDrafts.filter(
    (draft) => draft.atributoCatalogoId > 0,
  );
  const activeAttributeIds = new Set(
    normalizedDrafts
      .map((draft) => draft.id)
      .filter(
        (attributeId): attributeId is number =>
          typeof attributeId === "number" && attributeId > 0,
      ),
  );

  const operations: Promise<unknown>[] = [];

  for (const draft of normalizedDrafts) {
    const payload: ProductAttributeDraftPayload = {
      atributoCatalogoId: draft.atributoCatalogoId,
      atributoCatalogoValorIds: draft.atributoCatalogoValorIds,
    };

    if (draft.atributoCatalogoValorIds.length === 0) {
      if (draft.id) {
        operations.push(deleteProductAttribute(storeId, productId, draft.id));
      }

      continue;
    }

    if (draft.id) {
      operations.push(
        updateProductAttribute(storeId, productId, draft.id, payload),
      );
    } else {
      operations.push(createProductAttribute(storeId, productId, payload));
    }
  }

  for (const originalAttributeId of originalAttributeIds) {
    if (!activeAttributeIds.has(originalAttributeId)) {
      operations.push(
        deleteProductAttribute(storeId, productId, originalAttributeId),
      );
    }
  }

  if (operations.length > 0) {
    await Promise.all(operations);
  }

  return fetchProductAttributes(storeId, productId);
}

export async function syncProductVariants({
  storeId,
  productId,
  attributeDrafts,
  variantDrafts,
  persistedAttributes,
  originalVariantIds,
}: SyncProductVariantsParams) {
  const normalizedAttributes = attributeDrafts.filter(
    (draft) => draft.atributoCatalogoId > 0,
  );
  const normalizedVariants = variantDrafts.filter((draft) => draft.key.length > 0);

  if (normalizedAttributes.length === 0) {
    if (normalizedVariants.length > 0) {
      throw new Error("Debes agregar atributos antes de definir variantes.");
    }

    return;
  }

  if (normalizedVariants.length === 0) {
    throw new Error("Debes agregar al menos una variante.");
  }

  const originalVariantIdsSet = new Set(originalVariantIds);
  const activeVariantIds = new Set<number>();
  const createPayload: ProductVariantPayload[] = [];
  const updatePayloads: Array<{
    id: number;
    payload: ProductVariantPayload;
  }> = [];
  const signatures = new Set<string>();

  for (const variantDraft of normalizedVariants) {
    const payload = buildVariantPayload(
      variantDraft,
      normalizedAttributes,
      persistedAttributes,
    );

    if (
      payload.productoAtributoValorIds.length !== normalizedAttributes.length
    ) {
      throw new Error("Cada variante debe contener un valor para cada atributo.");
    }

    const signature = payload.productoAtributoValorIds
      .slice()
      .sort((a, b) => a - b)
      .join("|");

    if (signatures.has(signature)) {
      throw new Error("No puedes repetir la misma combinacion de atributos.");
    }

    signatures.add(signature);

    if (variantDraft.id && variantDraft.id > 0) {
      activeVariantIds.add(variantDraft.id);
      updatePayloads.push({ id: variantDraft.id, payload });
      continue;
    }

    createPayload.push(payload);
  }

  const deleteIds = Array.from(originalVariantIdsSet).filter(
    (variantId) => !activeVariantIds.has(variantId),
  );

  const operations: Promise<unknown>[] = [];

  if (createPayload.length > 0) {
    operations.push(
      createProductVariants(storeId, productId, {
        variantes: createPayload,
      }),
    );
  }

  updatePayloads.forEach(({ id, payload }) => {
    operations.push(updateProductVariant(storeId, productId, id, payload));
  });

  deleteIds.forEach((variantId) => {
    operations.push(deleteProductVariant(storeId, productId, variantId));
  });

  if (operations.length > 0) {
    await Promise.all(operations);
  }
}
