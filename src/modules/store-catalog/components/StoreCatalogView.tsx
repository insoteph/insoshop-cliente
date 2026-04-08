"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { StoreCatalogFilters } from "@/modules/store-catalog/components/StoreCatalogFilters";
import { StoreProductCard } from "@/modules/store-catalog/components/StoreProductCard";
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

export function StoreCatalogView({ slug }: StoreCatalogViewProps) {
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
  const whatsappHref = useMemo(() => {
    const phone = store?.telefono ?? "";
    const digitsOnly = phone.replace(/\D+/g, "");
    if (!digitsOnly) {
      return null;
    }

    return `https://wa.me/${digitsOnly}`;
  }, [store?.telefono]);

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 md:px-8 lg:px-12">
      <section className="mx-auto w-full max-w-7xl space-y-6">
        <header className="relative overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--panel-strong)] p-6 shadow-[var(--shadow)]">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[var(--accent-soft)] blur-2xl" />

          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)]">
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
          </div>
        </header>

        <div className="sticky top-3 z-30">
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
        </div>

        {error ? (
          <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">{error}</p>
        ) : null}

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={`catalog-skeleton-${index}`}
                className="app-card data-table-skeleton h-80 rounded-3xl"
              />
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <StoreProductCard
                  key={product.id}
                  slug={slug}
                  product={product}
                  currency={store?.moneda ?? "HNL"}
                />
              ))}
            </div>

            <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3 md:flex-row">
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

        <footer className="mt-10 rounded-3xl border border-[var(--line)] bg-[var(--panel)] px-5 py-4">
          <div className="flex flex-col gap-3 text-sm text-[var(--muted)] md:flex-row md:items-center md:justify-between">
            <p>
              Sitio web desarrollado por{" "}
              <a
                href="https://insoteph.com"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-[var(--accent)] hover:underline"
              >
                Insoteph
              </a>
            </p>

            <div className="flex items-center gap-2">
              <a
                href="#"
                className="app-button-secondary rounded-full px-3 py-2 text-xs font-semibold"
              >
                Facebook
              </a>
              <a
                href="#"
                className="app-button-secondary rounded-full px-3 py-2 text-xs font-semibold"
              >
                Instagram
              </a>
              <a
                href="#"
                className="app-button-secondary rounded-full px-3 py-2 text-xs font-semibold"
              >
                TikTok
              </a>
            </div>
          </div>
        </footer>
      </section>

      {whatsappHref ? (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full border border-[#1f9c59] bg-[#25d366] text-white shadow-xl transition-transform hover:scale-105"
          aria-label="Contactar por WhatsApp"
          title="Contactar por WhatsApp"
        >
          WA
        </a>
      ) : null}
    </main>
  );
}
