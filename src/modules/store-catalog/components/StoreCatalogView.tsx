"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

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

  const pageLabel = useMemo(
    () => `Pagina ${page} de ${Math.max(totalPages, 1)}`,
    [page, totalPages],
  );

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-6 md:px-8 lg:px-12 lg:py-8">
      <section className="mx-auto w-full max-w-7xl space-y-5">
        <header className="app-card rounded-3xl p-4 md:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)]">
                {store?.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={store.logoUrl}
                    alt={store.nombre}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                  Insoshop
                </p>
                <h1 className="text-2xl font-bold text-[var(--foreground-strong)]">
                  {store?.nombre ?? "Tienda"}
                </h1>
                <p className="text-sm text-[var(--muted)]">/{slug}</p>
              </div>
            </div>

            <StoreCartButton slug={slug} totalItems={totalItems} />
          </div>
        </header>

        <div className="grid items-start gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-3">
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

          <section className="space-y-4">
            <div className="app-card sticky top-3 z-20 rounded-2xl px-4 py-3">
              <p className="text-sm font-medium text-[var(--foreground)]">
                {totalRecords > 0
                  ? "Explora el catalogo y elige tus productos."
                  : "Sin resultados para los filtros actuales"}
              </p>
            </div>

            {error ? (
              <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">{error}</p>
            ) : null}

            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 9 }).map((_, index) => (
                  <div
                    key={`catalog-skeleton-${index}`}
                    className="app-card data-table-skeleton h-80 rounded-3xl"
                  />
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((product) => (
                    <StoreProductCard
                      key={product.id}
                      slug={slug}
                      product={product}
                      currency={store?.moneda ?? "HNL"}
                    />
                  ))}
                </div>

                <div className="app-card flex flex-col items-center justify-between gap-3 rounded-2xl px-4 py-3 md:flex-row">
                  <p className="text-sm text-[var(--foreground)]">{pageLabel}</p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPage((current) => Math.max(current - 1, 1))}
                      disabled={page <= 1}
                      className="app-button-secondary rounded-xl px-3 py-2 text-sm font-medium disabled:opacity-50"
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
                      className="app-button-secondary rounded-xl px-3 py-2 text-sm font-medium disabled:opacity-50"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="app-card rounded-3xl px-4 py-14 text-center">
                <p className="text-lg font-semibold text-[var(--foreground)]">
                  No hay productos para mostrar.
                </p>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Prueba cambiar la categoria o el texto de busqueda.
                </p>
              </div>
            )}
          </section>
        </div>

        <StoreCatalogFooter />
      </section>

      <FloatingWhatsAppButton phone={store?.telefono} />
    </main>
  );
}

export function StoreCatalogView({ slug }: StoreCatalogViewProps) {
  return (
    <StoreCartProvider slug={slug}>
      <StoreCatalogContent slug={slug} />
    </StoreCartProvider>
  );
}
