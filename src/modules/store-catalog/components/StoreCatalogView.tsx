"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { SearchBar } from "@/modules/core/components/SearchBar";
import { FloatingWhatsAppButton } from "@/modules/store-catalog/components/FloatingWhatsAppButton";
import { StoreCartButton } from "@/modules/store-catalog/components/StoreCartButton";
import { StoreCatalogFilters } from "@/modules/store-catalog/components/StoreCatalogFilters";
import { StoreCatalogFooter } from "@/modules/store-catalog/components/StoreCatalogFooter";
import { StoreCatalogThemeToggle } from "@/modules/store-catalog/components/StoreCatalogThemeToggle";
import { StoreFavoritesPanel } from "@/modules/store-catalog/components/StoreFavoritesPanel";
import { StoreProductCard } from "@/modules/store-catalog/components/StoreProductCard";
import {
  readStoreCatalogTheme,
  writeStoreCatalogTheme,
  type StoreCatalogTheme,
} from "@/modules/store-catalog/lib/store-catalog-theme-storage";
import { storeCatalogThemeTokens } from "@/modules/store-catalog/lib/store-catalog-theme-tokens";
import {
  readStoreFavorites,
  writeStoreFavorites,
  type StoreFavoriteProduct,
} from "@/modules/store-catalog/lib/store-favorites-storage";
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

  const [theme, setTheme] = useState<StoreCatalogTheme>("light");
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
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoriteItems, setFavoriteItems] = useState<StoreFavoriteProduct[]>([]);
  const [favoritesLoadedSlug, setFavoritesLoadedSlug] = useState<string | null>(
    null,
  );
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);

  useEffect(() => {
    setTheme(readStoreCatalogTheme());
  }, []);

  useEffect(() => {
    writeStoreCatalogTheme(theme);
  }, [theme]);

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
          categoriaId: selectedCategoryId,
        }),
        fetchPublicStoreCategories(slug),
      ]);

      setStore(productsResult.tienda);
      setProducts(productsResult.productos.items);
      setTotalPages(productsResult.productos.totalPages);
      setTotalRecords(productsResult.productos.totalRecords);
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

  const activeCategory = useMemo(
    () =>
      categories.find((category) => category.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId],
  );

  const favoriteIds = useMemo(
    () => new Set(favoriteItems.map((item) => item.id)),
    [favoriteItems],
  );

  const pageLabel = useMemo(
    () => `Pagina ${page} de ${Math.max(totalPages, 1)}`,
    [page, totalPages],
  );

  const resultsLabel = useMemo(() => {
    if (totalRecords <= 0) {
      return "Sin resultados";
    }

    return `${totalRecords} producto${totalRecords === 1 ? "" : "s"}`;
  }, [totalRecords]);

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
    <div className="bg-[var(--background)]" style={storeCatalogThemeTokens[theme]}>
      <main className="min-h-screen bg-[var(--background)]">
        <section className="mx-auto w-full max-w-[1440px] px-4 py-4 md:px-6 lg:px-8 lg:py-6">
          <header className="rounded-[28px] border border-[var(--line)] bg-[var(--panel-strong)] p-4 shadow-[var(--shadow)] md:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)]">
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

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                    {store?.nombre ?? "Tienda"}
                  </p>
                  <p className="text-sm text-[var(--muted)]">/{slug}</p>
                </div>
              </div>

              <div className="order-3 w-full xl:order-2 xl:max-w-xl">
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

              <div className="order-2 flex w-full items-center justify-end gap-2 xl:order-3 xl:w-auto xl:gap-3">
                <StoreCatalogThemeToggle
                  theme={theme}
                  onToggle={() =>
                    setTheme((current) => (current === "dark" ? "light" : "dark"))
                  }
                />
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

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => {
                  setPage(1);
                  setSelectedCategoryId(null);
                }}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
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
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    selectedCategoryId === category.id
                      ? "bg-[var(--accent)] text-white"
                      : "bg-[var(--panel-muted)] text-[var(--muted)]"
                  }`}
                >
                  {category.nombre}
                </button>
              ))}
            </div>
          </header>

          <div className="mt-6 grid items-start gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
            <aside className="lg:sticky lg:top-4">
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
              <div className="rounded-[28px] border border-[var(--line)] bg-[var(--panel-strong)] px-4 py-4 shadow-[var(--shadow)] md:px-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-2">
                    <p className="text-xs text-[var(--muted)]">
                      Inicio / {store?.nombre ?? "Tienda"} /{" "}
                      {activeCategory?.nombre ?? "Catalogo"}
                    </p>
                    <div>
                      <h1 className="text-3xl font-semibold text-[var(--foreground-strong)]">
                        {activeCategory?.nombre ?? "Catalogo"}
                      </h1>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {resultsLabel}
                        {search.trim() ? ` para "${search.trim()}"` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-2 text-sm text-[var(--muted)]">
                      Orden: mas recientes
                    </div>
                    <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-2 text-sm text-[var(--muted)]">
                      {pageLabel}
                    </div>
                  </div>
                </div>
              </div>

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
                        onClick={() => setPage((current) => Math.max(current - 1, 1))}
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
                        className="rounded-2xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_16px_26px_rgba(109,56,255,0.2)] disabled:cursor-not-allowed disabled:opacity-50"
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
