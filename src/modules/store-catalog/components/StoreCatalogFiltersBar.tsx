"use client";

import type { PublicStoreCategory } from "@/modules/store-catalog/types/store-catalog-types";

type StoreCatalogFiltersBarProps = {
  categories: PublicStoreCategory[];
  selectedCategoryId: number | null;
  onCategoryChange: (value: number | null) => void;
  onClearAll: () => void;
};

export function StoreCatalogFiltersBar({
  categories,
  selectedCategoryId,
  onCategoryChange,
  onClearAll,
}: StoreCatalogFiltersBarProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      <button
        type="button"
        onClick={() => onCategoryChange(null)}
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
          onClick={() => onCategoryChange(category.id)}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition sm:px-4 sm:py-2 sm:text-sm ${
            selectedCategoryId === category.id
              ? "border-white bg-white text-[#1D4ED8] shadow-[0_10px_20px_rgba(15,23,42,0.18)]"
              : "border-white/20 bg-white/10 text-white hover:bg-white/15"
          }`}
        >
          {category.nombre}
        </button>
      ))}

      <button
        type="button"
        onClick={onClearAll}
        className="shrink-0 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/15 sm:px-4 sm:py-2 sm:text-sm"
      >
        Limpiar
      </button>
    </div>
  );
}
