"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { SearchBar } from "@/modules/core/components/SearchBar";
import { FloatingWhatsAppButton } from "@/modules/store-catalog/components/FloatingWhatsAppButton";
import { StoreCartButton } from "@/modules/store-catalog/components/StoreCartButton";
import { StoreCatalogFilters } from "@/modules/store-catalog/components/StoreCatalogFilters";
import { StoreCatalogFooter } from "@/modules/store-catalog/components/StoreCatalogFooter";
import { StoreFavoritesPanel } from "@/modules/store-catalog/components/StoreFavoritesPanel";
import { StoreProductCard } from "@/modules/store-catalog/components/StoreProductCard";
import { storeCatalogThemeTokens } from "@/modules/store-catalog/lib/store-catalog-theme-tokens";
import {
  readStoreFavorites,
  writeStoreFavorites,
  type StoreFavoriteProduct,
} from "@/modules/store-catalog/lib/store-favorites-storage";
import { usePublicStoreLightMode } from "@/modules/store-catalog/lib/use-public-store-light-mode";
import {
  StoreCartProvider,
  useStoreCart,
} from "@/modules/store-catalog/providers/StoreCartProvider";
import {
  fetchPublicStoreCategories,
  fetchPublicStoreProducts,
} from "@/modules/store-catalog/services/store-catalog-service";
import type {
  PublicStoreCategory,
  PublicStoreProduct,
  PublicStoreSummary,
} from "@/modules/store-catalog/types/store-catalog-types";

type StoreCatalogViewProps = {
  slug: string;
};

function toFavoriteProduct(product: PublicStoreProduct): StoreFavoriteProduct {
  return {
    id: product.id,
    nombre: product.nombre,
    categoria: product.categoria,
    precio: product.precio,
    cantidadDisponible: product.cantidadDisponible,
    imagenUrl: product.imagenes[0]?.trim() || null,
  };
}

function StoreCatalogContent({ slug }: StoreCatalogViewProps) {
  const { totalItems } = useStoreCart();

  const [store, setStore] = useState<PublicStoreSummary | null>(null);
  const [products, setProducts] = useState<PublicStoreProduct[]>([]);
  const [categories, setCategories] = useState<PublicStoreCategory[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoriteItems, setFavoriteItems] = useState<StoreFavoriteProduct[]>(
    [],
  );
  const [favoritesLoadedSlug, setFavoritesLoadedSlug] = useState<string | null>(
    null,
  );
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);

  usePublicStoreLightMode();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 320);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    setFavoriteItems(readStoreFavorites(slug));
    setFavoritesLoadedSlug(slug);
  }, [slug]);

  useEffect(() => {
    if (favoritesLoadedSlug !== slug) {
      return;
    }

    writeStoreFavorites(slug, favoriteItems);
  }, [favoriteItems, favoritesLoadedSlug, slug]);

  const loadCatalog = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [productsResult, categoriesResult] = await Promise.all([
        fetchPublicStoreProducts({
          slug,
          page,
          pageSize,
          search: debouncedSearch,
          categorias: selectedCategoryId,
        }),
        fetchPublicStoreCategories(slug),
      ]);

      setStore(productsResult.tienda);
      setProducts(productsResult.productos.items);
      setTotalPages(productsResult.productos.totalPages);
      setCategories(categoriesResult);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudo cargar el catalogo de esta tienda.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, page, pageSize, selectedCategoryId, slug]);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const favoriteIds = useMemo(
    () => new Set(favoriteItems.map((item) => item.id)),
    [favoriteItems],
  );

  const pageLabel = useMemo(
    () => `Pagina ${page} de ${Math.max(totalPages, 1)}`,
    [page, totalPages],
  );

  const visibleCategories = useMemo(() => categories.slice(0, 8), [categories]);

  const handleToggleFavorite = useCallback((product: PublicStoreProduct) => {
    const favorite = toFavoriteProduct(product);

    setFavoriteItems((currentItems) => {
      const exists = currentItems.some((item) => item.id === favorite.id);
      if (exists) {
        return currentItems.filter((item) => item.id !== favorite.id);
      }

      return [favorite, ...currentItems];
    });
  }, []);

  const handleRemoveFavorite = useCallback((productId: number) => {
    setFavoriteItems((currentItems) =>
      currentItems.filter((item) => item.id !== productId),
    );
  }, []);

  return (
    <div
      className="bg-[var(--background)]"
      style={storeCatalogThemeTokens.light}
    >
      <main className="min-h-screen bg-[var(--background)]">
        <section className="mx-auto w-full max-w-[1440px] px-4 py-4 md:px-6 lg:px-8 lg:py-6">
          <header className="sticky top-0 z-30 rounded-[24px] border border-[var(--line)] bg-[var(--panel-strong)] p-3 shadow-[var(--shadow)] backdrop-blur lg:static lg:rounded-[28px] lg:p-5">
            <div className="space-y-3 lg:space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] sm:h-12 sm:w-12">
                    {store?.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={store.logoUrl}
                        alt={store.nombre}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-bold uppercase text-[var(--foreground-strong)]">
                        {(store?.nombre ?? "IS").slice(0, 2)}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="max-w-[42vw] truncate text-xs font-semibold uppercase tracking-[0.1em] text-[var(--muted)] sm:max-w-[320px] sm:tracking-[0.18em]">
                      {store?.nombre ?? "Tienda"}
                    </p>
                    <p className="text-xs text-[var(--muted)] sm:text-sm">
                      /{slug}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <StoreFavoritesPanel
                    slug={slug}
                    currency={store?.moneda ?? "HNL"}
                    items={favoriteItems}
                    isOpen={isFavoritesOpen}
                    onToggle={() => setIsFavoritesOpen((current) => !current)}
                    onRemoveFavorite={handleRemoveFavorite}
                  />
                  <StoreCartButton slug={slug} totalItems={totalItems} />
                </div>
              </div>

              <div>
                <SearchBar
                  value={search}
                  onChange={(value) => {
                    setPage(1);
                    setSearch(value);
                  }}
                  placeholder="Buscar producto"
                  ariaLabel="Buscar producto"
                  className="!rounded-2xl"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => {
                    setPage(1);
                    setSelectedCategoryId(null);
                  }}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition sm:px-4 sm:py-2 sm:text-sm ${
                    selectedCategoryId === null
                      ? "bg-[var(--accent)] text-white"
                      : "bg-[var(--panel-muted)] text-[var(--muted)]"
                  }`}
                >
                  Todas
                </button>

                {visibleCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      setPage(1);
                      setSelectedCategoryId(category.id);
                    }}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition sm:px-4 sm:py-2 sm:text-sm ${
                      selectedCategoryId === category.id
                        ? "bg-[var(--accent)] text-white"
                        : "bg-[var(--panel-muted)] text-[var(--muted)]"
                    }`}
                  >
                    {category.nombre}
                  </button>
                ))}
              </div>
            </div>
          </header>

          <div className="mt-6 grid items-start gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
            <aside className="hidden lg:sticky lg:top-4 lg:block">
              <StoreCatalogFilters
                search={search}
                onSearchChange={(value) => {
                  setPage(1);
                  setSearch(value);
                }}
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onCategoryChange={(value) => {
                  setPage(1);
                  setSelectedCategoryId(value);
                }}
              />
            </aside>

            <section className="space-y-5">
              {error ? (
                <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
                  {error}
                </p>
              ) : null}

              {isLoading ? (
                <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div
                      key={`catalog-skeleton-${index}`}
                      className="h-[280px] rounded-[24px] border border-[var(--line)] bg-[var(--panel-strong)] sm:h-[360px]"
                    />
                  ))}
                </div>
              ) : products.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
                    {products.map((product) => (
                      <StoreProductCard
                        key={product.id}
                        slug={slug}
                        product={product}
                        currency={store?.moneda ?? "HNL"}
                        isFavorite={favoriteIds.has(product.id)}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    ))}
                  </div>

                  <div className="flex flex-col items-center justify-between gap-3 rounded-[24px] border border-[var(--line)] bg-[var(--panel-strong)] px-4 py-4 md:flex-row">
                    <p className="text-sm text-[var(--muted)]">{pageLabel}</p>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setPage((current) => Math.max(current - 1, 1))
                        }
                        disabled={page <= 1}
                        className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Anterior
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setPage((current) =>
                            current >= totalPages ? current : current + 1,
                          )
                        }
                        disabled={page >= totalPages}
                        className="rounded-2xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow)] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-[28px] border border-[var(--line)] bg-[var(--panel-strong)] px-4 py-16 text-center">
                  <p className="text-lg font-semibold text-[var(--foreground-strong)]">
                    No hay productos para mostrar
                  </p>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    Ajusta la categoria o la busqueda para ver otros resultados.
                  </p>
                </div>
              )}
            </section>
          </div>
        </section>

        <FloatingWhatsAppButton phone={store?.telefono} />
      </main>

      <StoreCatalogFooter storeName={store?.nombre} phone={store?.telefono} />
    </div>
  );
}

export function StoreCatalogView({ slug }: StoreCatalogViewProps) {
  return (
    <StoreCartProvider slug={slug}>
      <StoreCatalogContent slug={slug} />
    </StoreCartProvider>
  );
}
