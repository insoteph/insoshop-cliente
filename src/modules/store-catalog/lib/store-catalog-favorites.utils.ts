"use client";

import type { PublicStoreProduct } from "@/modules/store-catalog/types/store-catalog-types";
import type { StoreFavoriteProduct } from "@/modules/store-catalog/lib/store-favorites-storage";

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
