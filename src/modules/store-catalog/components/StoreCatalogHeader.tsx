"use client";

import { SearchBar } from "@/modules/core/components/SearchBar";
import { StoreCartButton } from "@/modules/store-catalog/components/StoreCartButton";
import { StoreFavoritesPanel } from "@/modules/store-catalog/components/StoreFavoritesPanel";
import type { PublicStoreSummary } from "@/modules/store-catalog/types/store-catalog-types";
import type { StoreFavoriteProduct } from "@/modules/store-catalog/lib/store-favorites-storage";

type StoreCatalogHeaderProps = {
  slug: string;
  store: PublicStoreSummary | null;
  favoriteItems: StoreFavoriteProduct[];
  isFavoritesOpen: boolean;
  totalItems: number;
  search: string;
  onSearchChange: (value: string) => void;
  onToggleFavorites: () => void;
  onRemoveFavorite: (productId: number) => void;
};

export function StoreCatalogHeader({
  slug,
  store,
  favoriteItems,
  isFavoritesOpen,
  totalItems,
  search,
  onSearchChange,
  onToggleFavorites,
  onRemoveFavorite,
}: StoreCatalogHeaderProps) {
  return (
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
                onToggle={onToggleFavorites}
                onRemoveFavorite={onRemoveFavorite}
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
              onChange={onSearchChange}
              placeholder="Buscar producto"
              ariaLabel="Buscar producto"
              className="!h-10 !rounded-full !border-white/60 !bg-white !pl-10 !pr-4 !text-sm !text-[var(--foreground-strong)] !shadow-[0_12px_28px_rgba(15,23,42,0.12)] placeholder:!text-slate-400 sm:!h-14 sm:!pl-12 sm:!pr-5"
              iconClassName="text-[#2563EB]"
              inputClassName="ring-0 focus:!border-white focus:!shadow-[0_16px_34px_rgba(15,23,42,0.16)]"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
