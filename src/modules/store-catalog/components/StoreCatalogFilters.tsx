"use client";

import { SearchBar } from "@/modules/core/components/SearchBar";
import type { PublicStoreCategory } from "@/modules/store-catalog/types/store-catalog-types";

type StoreCatalogFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  categories: PublicStoreCategory[];
  selectedCategoryId: number | null;
  onCategoryChange: (value: number | null) => void;
};

export function StoreCatalogFilters({
  search,
  onSearchChange,
  categories,
  selectedCategoryId,
  onCategoryChange,
}: StoreCatalogFiltersProps) {
  return (
    <section className="app-card space-y-5 rounded-3xl p-4 md:p-5">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
          Busqueda
        </p>
        <SearchBar
          value={search}
          onChange={onSearchChange}
          placeholder="Buscar productos"
          ariaLabel="Buscar productos"
        />
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
          Categorias
        </p>
        <button
          type="button"
          onClick={() => onCategoryChange(null)}
          className={`flex w-full items-center justify-start rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
            selectedCategoryId === null
              ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--foreground-strong)]"
              : "border-[var(--line)] bg-[var(--panel-strong)] text-[var(--foreground)] hover:border-[var(--line-strong)]"
          }`}
        >
          Todas
        </button>

        <div className="max-h-[340px] space-y-2 overflow-y-auto pr-1">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => onCategoryChange(category.id)}
              className={`flex w-full items-center justify-start rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                selectedCategoryId === category.id
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--foreground-strong)]"
                  : "border-[var(--line)] bg-[var(--panel-strong)] text-[var(--foreground)] hover:border-[var(--line-strong)]"
              }`}
            >
              {category.nombre}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
