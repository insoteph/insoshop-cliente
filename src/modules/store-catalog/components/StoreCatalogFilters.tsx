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
    <section className="space-y-4 rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-4 shadow-[var(--shadow)]">
      <SearchBar
        value={search}
        onChange={onSearchChange}
        placeholder="Buscar productos por nombre o descripcion"
        ariaLabel="Buscar productos"
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onCategoryChange(null)}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
            selectedCategoryId === null
              ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--foreground-strong)]"
              : "border-[var(--line)] bg-[var(--panel-strong)] text-[var(--muted)] hover:border-[var(--line-strong)]"
          }`}
        >
          Todas
        </button>

        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onCategoryChange(category.id)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              selectedCategoryId === category.id
                ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--foreground-strong)]"
                : "border-[var(--line)] bg-[var(--panel-strong)] text-[var(--muted)] hover:border-[var(--line-strong)]"
            }`}
          >
            {category.nombre}
          </button>
        ))}
      </div>
    </section>
  );
}
