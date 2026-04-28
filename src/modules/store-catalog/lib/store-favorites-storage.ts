export type StoreFavoriteProduct = {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  cantidadDisponible: number;
  imagenUrl: string | null;
};

function buildFavoritesKey(slug: string) {
  return `insoshop.store-favorites.${slug}`;
}

export function readStoreFavorites(slug: string): StoreFavoriteProduct[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(buildFavoritesKey(slug));
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as StoreFavoriteProduct[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item) =>
        typeof item?.id === "number" &&
        typeof item?.nombre === "string" &&
        typeof item?.categoria === "string" &&
        typeof item?.precio === "number" &&
        typeof item?.cantidadDisponible === "number" &&
        (typeof item?.imagenUrl === "string" || item?.imagenUrl === null),
    );
  } catch {
    return [];
  }
}

export function writeStoreFavorites(slug: string, items: StoreFavoriteProduct[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(buildFavoritesKey(slug), JSON.stringify(items));
}
