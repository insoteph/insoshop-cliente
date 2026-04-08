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

    const parsed = JSON.parse(raw) as StoreCartItem[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
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
