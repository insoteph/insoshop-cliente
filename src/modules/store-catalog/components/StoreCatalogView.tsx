"use client";

import { FloatingWhatsAppButton } from "@/modules/store-catalog/components/FloatingWhatsAppButton";
import { StoreCatalogFooter } from "@/modules/store-catalog/components/StoreCatalogFooter";
import { StoreCatalogFilters } from "@/modules/store-catalog/components/StoreCatalogFilters";
import { StoreCatalogHeroCarousel } from "@/modules/store-catalog/components/StoreCatalogHeroCarousel";
import { StoreCatalogHeader } from "@/modules/store-catalog/components/StoreCatalogHeader";
import { storeCatalogThemeTokens } from "@/modules/store-catalog/lib/store-catalog-theme-tokens";
import { StoreCartProvider } from "@/modules/store-catalog/providers/StoreCartProvider";
import { StoreProductCard } from "@/modules/store-catalog/components/StoreProductCard";
import { useStoreCatalogView } from "@/modules/store-catalog/hooks/useStoreCatalogView";

type StoreCatalogViewProps = {
  slug: string;
};

function StoreCatalogContent({ slug }: StoreCatalogViewProps) {
  const {
    store,
    products,
    categories,
    error,
    isLoading,
    favoriteItems,
    favoriteIds,
    isFavoritesOpen,
    totalItems,
    pageLabel,
    categoryCounts,
    selectedCategoryId,
    totalRecords,
    page,
    totalPages,
    handleToggleFavorite,
    handleRemoveFavorite,
    handleSearchChange,
    handleCategoryChange,
    handleClearFilters,
    handlePageChange,
    toggleFavoritesPanel,
  } = useStoreCatalogView({ slug });

  return (
    <div
      className="bg-[var(--background)]"
      style={storeCatalogThemeTokens.light}
    >
      <main className="min-h-screen overflow-x-clip bg-[var(--background)]">
        <StoreCatalogHeader
          slug={slug}
          store={store}
          favoriteItems={favoriteItems}
          isFavoritesOpen={isFavoritesOpen}
          totalItems={totalItems}
          search={""}
          onSearchChange={handleSearchChange}
          onToggleFavorites={toggleFavoritesPanel}
          onRemoveFavorite={handleRemoveFavorite}
        />

        <StoreCatalogHeroCarousel />

        <section className="mx-auto w-full max-w-[1440px] px-3 pb-4 pt-4 sm:px-4 sm:pt-6 md:px-6 lg:px-8 lg:pb-6">
          <div className="grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
            <aside className="hidden lg:sticky lg:top-4 lg:block">
              <StoreCatalogFilters
                onSearchChange={handleSearchChange}
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onCategoryChange={handleCategoryChange}
                categoryCounts={categoryCounts}
                resultsCount={totalRecords}
                onClearAll={handleClearFilters}
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
                      className="h-[246px] rounded-[18px] border border-[var(--line)] bg-[var(--panel-strong)] min-[390px]:h-[260px] sm:h-[360px] sm:rounded-[24px]"
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
                        onClick={() => handlePageChange(Math.max(page - 1, 1))}
                        disabled={page <= 1}
                        className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Anterior
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handlePageChange(page >= totalPages ? page : page + 1)
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
