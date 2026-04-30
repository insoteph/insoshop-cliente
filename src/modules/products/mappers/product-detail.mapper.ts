import type {
  Product,
  ProductAttribute,
  ProductImagePayload,
  ProductVariant,
} from "@/modules/products/services/product-service";

function normalizeText(value: string | null | undefined) {
  return value?.trim() ?? "";
}

function compareProductImages(
  first: ProductImagePayload,
  second: ProductImagePayload,
) {
  if (first.esPrincipal && !second.esPrincipal) {
    return -1;
  }

  if (!first.esPrincipal && second.esPrincipal) {
    return 1;
  }

  return (first.orden ?? 0) - (second.orden ?? 0);
}

export function getProductDetailImageUrls(
  images: Product["imagenes"],
  variants: ProductVariant[] = [],
) {
  const productImages = images
    .slice()
    .sort(compareProductImages)
    .map((image) => normalizeText(image.url))
    .filter(Boolean);

  const variantImages = variants
    .flatMap((variant) => [
      ...variant.imagenes,
      variant.urlImagenPrincipal ?? "",
    ])
    .map((image) => normalizeText(image))
    .filter(Boolean);

  return [...productImages, ...variantImages].filter((image, index, list) => {
    return list.indexOf(image) === index;
  });
}

export function buildProductVariantSummary(variant: ProductVariant) {
  const summary = variant.valores
    .map((value) => normalizeText(value.valor))
    .filter(Boolean)
    .join(" / ");

  return summary.length > 0 ? summary : "Sin atributos";
}

export function isProductColorAttribute(attribute: ProductAttribute) {
  return (
    normalizeText(attribute.atributoCatalogoNombre)
      .toLowerCase()
      .includes("color") ||
    attribute.valores.some((value) =>
      Boolean(normalizeText(value.colorHexadecimal)),
    )
  );
}

export function getProductAttributeValues(attribute: ProductAttribute) {
  return attribute.valores
    .slice()
    .sort((first, second) => (first.orden ?? 0) - (second.orden ?? 0));
}
