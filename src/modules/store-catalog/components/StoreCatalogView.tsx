"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { SearchBar } from "@/modules/core/components/SearchBar";
import { StoreCartButton } from "@/modules/store-catalog/components/StoreCartButton";
import { StoreCatalogFilters } from "@/modules/store-catalog/components/StoreCatalogFilters";
import { StoreCatalogFooter } from "@/modules/store-catalog/components/StoreCatalogFooter";
import { StoreProductCard } from "@/modules/store-catalog/components/StoreProductCard";
import { FloatingWhatsAppButton } from "@/modules/store-catalog/components/FloatingWhatsAppButton";
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

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 320);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

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

  return (
    <>
      <main className="min-h-screen bg-[#f5f6fb]">
        <section className="mx-auto w-full max-w-[1440px] px-4 py-4 md:px-6 lg:px-8 lg:py-6">
          <header className="rounded-[28px] border border-[#e8ebf5] bg-white p-4 shadow-[0_16px_40px_rgba(32,40,84,0.06)] md:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-[#eceef7] bg-[#f7f8fd]">
                  {store?.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={store.logoUrl}
                      alt={store.nombre}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold uppercase text-[#1c2140]">
                      {(store?.nombre ?? "IS").slice(0, 2)}
                    </span>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a91ac]">
                    {store?.nombre ?? "Tienda"}
                  </p>
                  <p className="text-sm text-[#646d88]">/{slug}</p>
                </div>
              </div>

              <div className="w-full xl:max-w-xl">
                <SearchBar
                  value={search}
                  onChange={(value) => {
                    setPage(1);
                    setSearch(value);
                  }}
                  placeholder="Buscar producto"
                  ariaLabel="Buscar producto"
                  className="!rounded-2xl !border-[#e6e9f4] !bg-white !text-[#1a1d2d] !shadow-none placeholder:!text-[#9aa1ba] focus:!border-[#d8def0] focus:!shadow-[0_0_0_4px_rgba(109,56,255,0.08)]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-2xl border border-[#eceef7] bg-[#f8f9fd] px-4 py-2 text-sm font-semibold text-[#59617c]">
                  {store?.moneda ?? "HNL"}
                </div>
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
                    ? "bg-[#6d38ff] text-white"
                    : "bg-[#f4f6fc] text-[#535b77]"
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
                      ? "bg-[#6d38ff] text-white"
                      : "bg-[#f4f6fc] text-[#535b77]"
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
              <div className="rounded-[28px] border border-[#e8ebf5] bg-white px-4 py-4 shadow-[0_16px_40px_rgba(32,40,84,0.05)] md:px-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-2">
                    <p className="text-xs text-[#9aa1ba]">
                      Inicio / {store?.nombre ?? "Tienda"} /{" "}
                      {activeCategory?.nombre ?? "Catalogo"}
                    </p>
                    <div>
                      <h1 className="text-3xl font-semibold text-[#1a1d2d]">
                        {activeCategory?.nombre ?? "Catalogo"}
                      </h1>
                      <p className="mt-1 text-sm text-[#67708c]">
                        {resultsLabel}
                        {search.trim() ? ` para "${search.trim()}"` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="rounded-2xl border border-[#eceef7] bg-[#f8f9fd] px-4 py-2 text-sm text-[#5f6781]">
                      Orden: mas recientes
                    </div>
                    <div className="rounded-2xl border border-[#eceef7] bg-[#f8f9fd] px-4 py-2 text-sm text-[#5f6781]">
                      {pageLabel}
                    </div>
                  </div>
                </div>
              </div>

              {error ? (
                <p className="rounded-2xl border border-[#f0c8c4] bg-[#fff1ef] px-4 py-3 text-sm text-[#9d3d34]">
                  {error}
                </p>
              ) : null}

              {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div
                      key={`catalog-skeleton-${index}`}
                      className="h-[420px] rounded-[24px] border border-[#e8ebf5] bg-white"
                    />
                  ))}
                </div>
              ) : products.length > 0 ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {products.map((product) => (
                      <StoreProductCard
                        key={product.id}
                        slug={slug}
                        product={product}
                        currency={store?.moneda ?? "HNL"}
                      />
                    ))}
                  </div>

                  <div className="flex flex-col items-center justify-between gap-3 rounded-[24px] border border-[#e8ebf5] bg-white px-4 py-4 md:flex-row">
                    <p className="text-sm text-[#646d88]">{pageLabel}</p>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPage((current) => Math.max(current - 1, 1))}
                        disabled={page <= 1}
                        className="rounded-2xl border border-[#e3e7f3] bg-[#f8f9fd] px-4 py-2.5 text-sm font-semibold text-[#212640] disabled:cursor-not-allowed disabled:opacity-50"
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
                        className="rounded-2xl bg-[#6d38ff] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_16px_26px_rgba(109,56,255,0.18)] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-[28px] border border-[#e8ebf5] bg-white px-4 py-16 text-center">
                  <p className="text-lg font-semibold text-[#1a1d2d]">
                    No hay productos para mostrar
                  </p>
                  <p className="mt-2 text-sm text-[#67708c]">
                    Ajusta la categoria o la busqueda para ver otros resultados.
                  </p>
                </div>
              )}
            </section>
          </div>
        </section>
      </main>

      <StoreCatalogFooter
        storeName={store?.nombre}
        slug={slug}
        phone={store?.telefono}
      />

      <FloatingWhatsAppButton phone={store?.telefono} />
    </>
  );
}

export function StoreCatalogView({ slug }: StoreCatalogViewProps) {
  return (
    <StoreCartProvider slug={slug}>
      <StoreCatalogContent slug={slug} />
    </StoreCartProvider>
  );
}
