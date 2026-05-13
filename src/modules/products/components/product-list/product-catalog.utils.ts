"use client";

import type { Product } from "@/modules/products/services/product-service";

export function getProductPrimaryImageUrl(product: Product) {
  return product.imagenes.find((image) => image.url.trim())?.url.trim() ?? null;
}
