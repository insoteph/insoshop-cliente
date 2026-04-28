import type { StoreCartItem } from "@/modules/store-catalog/types/store-cart-types";

function buildCartKey(slug: string) {
  return `insoshop.store-cart.${slug}`;
}

export function readStoreCart(slug: string): StoreCartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(buildCartKey(slug));
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.flatMap(normalizeCartItem);
  } catch {
    return [];
  }
}

export function writeStoreCart(slug: string, items: StoreCartItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(buildCartKey(slug), JSON.stringify(items));
}

export function clearStoreCart(slug: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(buildCartKey(slug));
}

function normalizeCartItem(rawItem: unknown): StoreCartItem[] {
  if (typeof rawItem !== "object" || rawItem === null) {
    return [];
  }

  const item = rawItem as Record<string, unknown>;
  const productId = Number(item.productId);
  const productoVarianteId = Number(item.productoVarianteId);
  const precio = Number(item.precio);
  const cantidad = Number(item.cantidad);
  const cantidadDisponible = Number(item.cantidadDisponible);

  if (
    !Number.isInteger(productId) ||
    productId <= 0 ||
    !Number.isInteger(productoVarianteId) ||
    productoVarianteId <= 0 ||
    !Number.isFinite(precio) ||
    !Number.isFinite(cantidad) ||
    !Number.isFinite(cantidadDisponible)
  ) {
    return [];
  }

  return [
    {
      productId,
      productoVarianteId,
      nombre: typeof item.nombre === "string" ? item.nombre : "",
      precio,
      cantidad: Math.max(1, Math.trunc(cantidad)),
      cantidadDisponible: Math.max(0, Math.trunc(cantidadDisponible)),
      categoria: typeof item.categoria === "string" ? item.categoria : "",
      imagenUrl: normalizeImageUrl(item),
      varianteResumen:
        typeof item.varianteResumen === "string" ? item.varianteResumen : "",
    },
  ];
}

function normalizeImageUrl(item: Record<string, unknown>) {
  const directImage =
    typeof item.imagenUrl === "string"
      ? item.imagenUrl
      : typeof item.imageUrl === "string"
        ? item.imageUrl
        : typeof item.imagen === "string"
          ? item.imagen
          : null;

  if (directImage?.trim()) {
    return directImage.trim();
  }

  if (Array.isArray(item.imagenes)) {
    const firstImage = item.imagenes.find(
      (image): image is string => typeof image === "string" && image.trim().length > 0,
    );

    if (firstImage) {
      return firstImage.trim();
    }
  }

  return null;
}
