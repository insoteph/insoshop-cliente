"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { SearchBar } from "@/modules/core/components/SearchBar";
import { FloatingWhatsAppButton } from "@/modules/store-catalog/components/FloatingWhatsAppButton";
import { StoreCatalogHeroCarousel } from "@/modules/store-catalog/components/StoreCatalogHeroCarousel";
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
  const [totalRecords, setTotalRecords] = useState(0);
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

  const favoriteIds = useMemo(
    () => new Set(favoriteItems.map((item) => item.id)),
    [favoriteItems],
  );

  const pageLabel = useMemo(
    () => `Pagina ${page} de ${Math.max(totalPages, 1)}`,
    [page, totalPages],
  );

  const categoryCounts = useMemo(() => {
    return products.reduce<Record<number, number>>((accumulator, product) => {
      const matchedCategory = categories.find(
        (category) => category.nombre === product.categoria,
      );

      if (matchedCategory) {
        accumulator[matchedCategory.id] = (accumulator[matchedCategory.id] ?? 0) + 1;
      }

      return accumulator;
    }, {});
  }, [categories, products]);

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
      <main className="min-h-screen overflow-x-clip bg-[var(--background)]">
        <header className="sticky top-0 z-30 overflow-hidden rounded-b-3xl border border-transparent bg-[linear-gradient(135deg,#1D4ED8_0%,#2563EB_45%,#1E40AF_100%)] text-white shadow-[0_20px_48px_rgba(37,99,235,0.24)] lg:static lg:rounded-none lg:shadow-none">
          <div className="relative mx-auto w-full max-w-[1440px] px-4 py-4 md:px-6 lg:px-8 lg:py-6">
            <div className="absolute -right-12 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-white/10 blur-3xl" />

            <div className="relative space-y-4 sm:space-y-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md sm:h-14 sm:w-14">
                    {store?.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={store.logoUrl}
                        alt={store.nombre}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-bold uppercase text-white">
                        {(store?.nombre ?? "IS").slice(0, 2)}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="max-w-[42vw] truncate text-xs font-semibold uppercase tracking-[0.14em] text-white/75 sm:max-w-[320px] sm:text-sm sm:tracking-[0.18em]">
                      {store?.nombre ?? "Tienda"}
                    </p>
                    <p className="text-xs text-white/70 sm:text-sm">/{slug}</p>
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
                    className="border-white bg-white text-[#2563EB] shadow-[0_10px_24px_rgba(15,23,42,0.12)] hover:border-white hover:bg-white/95"
                  />
                  <StoreCartButton
                    slug={slug}
                    totalItems={totalItems}
                    className="border-white bg-white text-[#2563EB] shadow-[0_10px_24px_rgba(15,23,42,0.12)] hover:border-white hover:bg-white/95"
                  />
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <SearchBar
                  value={search}
                  onChange={(value) => {
                    setPage(1);
                    setSearch(value);
                  }}
                  placeholder="Buscar producto"
                  ariaLabel="Buscar producto"
                  className="!h-10 !rounded-full !border-white/60 !bg-white !pl-10 !pr-4 !text-sm !text-[var(--foreground-strong)] !shadow-[0_12px_28px_rgba(15,23,42,0.12)] placeholder:!text-slate-400 sm:!h-14 sm:!pl-12 sm:!pr-5"
                  iconClassName="text-[#2563EB]"
                  inputClassName="ring-0 focus:!border-white focus:!shadow-[0_16px_34px_rgba(15,23,42,0.16)]"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => {
                    setPage(1);
                    setSelectedCategoryId(null);
                  }}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition sm:px-4 sm:py-2 sm:text-sm ${
                    selectedCategoryId === null
                      ? "border-white bg-white text-[#1D4ED8] shadow-[0_10px_20px_rgba(15,23,42,0.18)]"
                      : "border-white/20 bg-white/10 text-white hover:bg-white/15"
                  }`}
                >
                  Todas
                </button>

                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      setPage(1);
                      setSelectedCategoryId(category.id);
                    }}
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition sm:px-4 sm:py-2 sm:text-sm ${
                      selectedCategoryId === category.id
                        ? "border-white bg-white text-[#1D4ED8] shadow-[0_10px_20px_rgba(15,23,42,0.18)]"
                        : "border-white/20 bg-white/10 text-white hover:bg-white/15"
                    }`}
                  >
                    {category.nombre}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        <StoreCatalogHeroCarousel />

        <section className="mx-auto w-full max-w-[1440px] px-3 pb-4 pt-4 sm:px-4 sm:pt-6 md:px-6 lg:px-8 lg:pb-6">
          <div className="grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
            <aside className="hidden lg:sticky lg:top-4 lg:block">
              <StoreCatalogFilters
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
                categoryCounts={categoryCounts}
                resultsCount={totalRecords}
                onClearAll={() => {
                  setPage(1);
                  setSearch("");
                  setSelectedCategoryId(null);
                }}
              />
            </aside>

            <section id="catalog-results" className="space-y-5">
              {error ? (
                <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
                  {error}
                </p>
              ) : null}

              {isLoading ? (
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:gap-4 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div
                      key={`catalog-skeleton-${index}`}
                      className="h-[292px] rounded-[18px] border border-[var(--line)] bg-[var(--panel-strong)] min-[390px]:h-[306px] sm:h-[360px] sm:rounded-[24px]"
                    />
                  ))}
                </div>
              ) : products.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:gap-4 xl:grid-cols-4">
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
