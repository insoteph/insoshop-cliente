"use client";

import type {
  PublicStoreProduct,
  PublicStoreProductAttribute,
  PublicStoreProductAttributeValue,
  PublicStoreProductDetail,
  PublicStoreProductVariant,
} from "@/modules/store-catalog/types/store-catalog-types";
import type { StoreFavoriteProduct } from "@/modules/store-catalog/lib/store-favorites-storage";

export type ProductAttributeSelectionInfo = {
  attribute: PublicStoreProductAttribute;
  label: string;
  values: PublicStoreProductAttributeValue[];
  selectedValueId: number;
  isLocked: boolean;
};

export function toFavoriteProduct(
  product: PublicStoreProduct,
): StoreFavoriteProduct {
  return {
    id: product.id,
    nombre: product.nombre,
    categoria: product.categoria,
    precio: product.precio,
    cantidadDisponible: product.cantidadDisponible,
    imagenUrl: product.imagenes[0]?.trim() || null,
  };
}

export function buildVariantSummary(variant: PublicStoreProductVariant) {
  return variant.valores.map((value) => value.valor).join(" / ");
}

export function isColorAttribute(attribute: PublicStoreProductAttribute) {
  return (
    attribute.nombre.trim().toLowerCase().includes("color") ||
    attribute.valores.some((value) => Boolean(value.colorHexadecimal))
  );
}

export function getVariantImageUrl(variant: PublicStoreProductVariant | null) {
  if (!variant) {
    return null;
  }

  return (
    variant.imagenes.find((image) => image.trim())?.trim() ||
    variant.urlImagenPrincipal?.trim() ||
    null
  );
}

export function buildImageSet(
  selectedVariant: PublicStoreProductVariant | null,
  allVariants: PublicStoreProductVariant[],
) {
  const preferred = (selectedVariant?.imagenes.length
    ? selectedVariant.imagenes
    : selectedVariant?.urlImagenPrincipal
      ? [selectedVariant.urlImagenPrincipal]
      : []
  ).map((image) => image.trim());

  const fallback = allVariants
    .flatMap((variant) =>
      variant.imagenes.length > 0
        ? variant.imagenes
        : variant.urlImagenPrincipal
          ? [variant.urlImagenPrincipal]
          : [],
    )
    .map((image) => image.trim());

  return [...preferred, ...fallback].filter((image, index, values) => {
    return image.length > 0 && values.indexOf(image) === index;
  });
}

export function findAnyVariantForAttributeValue(
  variants: PublicStoreProductVariant[],
  attributeId: number,
  valueId: number,
) {
  return (
    variants.find((variant) =>
      variant.valores.some(
        (value) =>
          value.atributoCatalogoId === attributeId &&
          value.atributoCatalogoValorId === valueId,
      ),
    ) ?? null
  );
}

export function hasAnyVariantForAttributeValue(
  variants: PublicStoreProductVariant[],
  attributeId: number,
  valueId: number,
) {
  return variants.some((variant) =>
    variant.valores.some(
      (value) =>
        value.atributoCatalogoId === attributeId &&
        value.atributoCatalogoValorId === valueId,
    ),
  );
}

export function variantMatchesSelection(
  variant: PublicStoreProductVariant,
  selections: Record<number, number>,
) {
  return Object.entries(selections).every(([attributeId, valueId]) =>
    variant.valores.some(
      (variantValue) =>
        variantValue.atributoCatalogoId === Number(attributeId) &&
        variantValue.atributoCatalogoValorId === valueId,
    ),
  );
}

export function findVariantByImageUrl(
  variants: PublicStoreProductVariant[],
  imageUrl: string,
) {
  const normalizedImageUrl = imageUrl.trim();
  if (!normalizedImageUrl) {
    return null;
  }

  return (
    variants.find((variant) =>
      [...(variant.imagenes ?? []), variant.urlImagenPrincipal ?? ""].some(
        (candidate) => candidate.trim() === normalizedImageUrl,
      ),
    ) ?? null
  );
}

export function buildSelectionFromVariantPreview(
  product: PublicStoreProductDetail,
  variants: PublicStoreProductVariant[],
  baseVariant: PublicStoreProductVariant,
) {
  const nextSelections: Record<number, number> = {};

  if (product.atributos.length === 0) {
    return nextSelections;
  }

  const firstAttribute = product.atributos[0];
  const firstVariantValue = baseVariant.valores.find(
    (value) => value.atributoCatalogoId === firstAttribute.atributoCatalogoId,
  );
  const firstValue =
    firstVariantValue?.atributoCatalogoValorId ??
    firstAttribute.valores[0]?.atributoCatalogoValorId;

  if (firstValue) {
    nextSelections[firstAttribute.atributoCatalogoId] = firstValue;
  }

  product.atributos.slice(1).forEach((attribute, index) => {
    const compatibleVariants = variants.filter((variant) =>
      variantMatchesSelection(variant, nextSelections),
    );

    const compatibleValue = attribute.valores.find((attributeValue) =>
      compatibleVariants.some((variant) =>
        variant.valores.some(
          (variantValue) =>
            variantValue.atributoCatalogoId === attribute.atributoCatalogoId &&
            variantValue.atributoCatalogoValorId ===
              attributeValue.atributoCatalogoValorId,
        ),
      ),
    );

    const baseVariantValue = baseVariant.valores.find(
      (value) => value.atributoCatalogoId === attribute.atributoCatalogoId,
    );

    const selectedValue =
      index === 0
        ? compatibleValue ?? baseVariantValue
        : compatibleValue ?? baseVariantValue ?? attribute.valores[0];

    if (selectedValue) {
      nextSelections[attribute.atributoCatalogoId] =
        selectedValue.atributoCatalogoValorId;
    }
  });

  return nextSelections;
}

export function getVariantAttributeValueId(
  variant: PublicStoreProductVariant | null,
  attributeId: number,
) {
  return (
    variant?.valores.find(
      (value) => value.atributoCatalogoId === attributeId,
    )?.atributoCatalogoValorId ?? null
  );
}

export function buildAttributeSelectionInfo(
  product: PublicStoreProductDetail | null,
  selectedValues: Record<number, number>,
  variants: PublicStoreProductVariant[],
): ProductAttributeSelectionInfo[] {
  if (!product) {
    return [];
  }

  const catalogById = new Map(
    product.atributos.map((attribute) => [
      attribute.atributoCatalogoId,
      attribute,
    ]),
  );

  return product.atributos.map((attribute, index) => {
    const priorAttributes = product.atributos.slice(0, index);
    const priorSelections = priorAttributes.reduce<Record<number, number>>(
      (accumulator, priorAttribute) => {
        const selectedValueId = selectedValues[priorAttribute.atributoCatalogoId];

        if (selectedValueId) {
          accumulator[priorAttribute.atributoCatalogoId] = selectedValueId;
        }

        return accumulator;
      },
      {},
    );

    const priorSelectionComplete =
      index === 0 ||
      priorAttributes.every((priorAttribute) =>
        Boolean(selectedValues[priorAttribute.atributoCatalogoId]),
      );

    const compatibleVariants = priorSelectionComplete
      ? variants.filter((variant) => variantMatchesSelection(variant, priorSelections))
      : [];

    const allValues = product.atributos[index]?.valores ?? [];
    const values =
      index === 0
        ? allValues
        : compatibleVariants.length > 0
          ? allValues.filter((attributeValue) =>
              compatibleVariants.some((variant) =>
                variant.valores.some(
                  (variantValue) =>
                    variantValue.atributoCatalogoId ===
                      attribute.atributoCatalogoId &&
                    variantValue.atributoCatalogoValorId ===
                      attributeValue.atributoCatalogoValorId,
                ),
              ),
            )
          : [];

    return {
      attribute,
      label: catalogById.get(attribute.atributoCatalogoId)?.nombre ?? attribute.nombre,
      values,
      selectedValueId: selectedValues[attribute.atributoCatalogoId] ?? 0,
      isLocked: index > 0 && !priorSelectionComplete,
    };
  });
}
