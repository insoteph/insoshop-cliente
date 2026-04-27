"use client";

import type { PublicStoreCategory } from "@/modules/store-catalog/types/store-catalog-types";

type StoreCatalogFiltersProps = {
  onSearchChange: (value: string) => void;
  categories: PublicStoreCategory[];
  selectedCategoryId: number | null;
  onCategoryChange: (value: number | null) => void;
  categoryCounts?: Record<number, number>;
  resultsCount?: number;
  onClearAll?: () => void;
};

export function StoreCatalogFilters({
  onSearchChange,
  categories,
  selectedCategoryId,
  onCategoryChange,
  categoryCounts = {},
  resultsCount = 0,
  onClearAll,
}: StoreCatalogFiltersProps) {
  return (
    <section className="overflow-hidden rounded-[22px] border border-[#E5EAF3] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between gap-3 border-b border-[#E5EAF3] px-6 py-5">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-block h-4 w-4 text-[#2563EB]"
            style={{
              WebkitMaskImage: "url(/icons/filter.svg)",
              maskImage: "url(/icons/filter.svg)",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskPosition: "center",
              WebkitMaskSize: "contain",
              maskSize: "contain",
              backgroundColor: "currentColor",
            }}
          />
          <h2 className="text-base font-semibold tracking-[-0.02em] text-[#0F172A]">
            Filtros
          </h2>
        </div>
        <button
          type="button"
          onClick={() => {
            onSearchChange("");
            onCategoryChange(null);
            onClearAll?.();
          }}
          className="text-sm font-semibold text-[#2563EB] transition hover:text-[#1D4ED8]"
        >
          <span className="inline-flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-block h-4 w-4"
              style={{
                WebkitMaskImage: "url(/icons/refresh.svg)",
                maskImage: "url(/icons/refresh.svg)",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
                WebkitMaskSize: "contain",
                maskSize: "contain",
                backgroundColor: "currentColor",
              }}
            />
            <span>Limpiar todo</span>
          </span>
        </button>
      </div>

      <div className="space-y-6 px-6 py-6">
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#64748B]">
            Categorías
          </p>

          <div className="space-y-2">
            <FilterRow
              label="Todas"
              checked={selectedCategoryId === null}
              count={resultsCount}
              onClick={() => onCategoryChange(null)}
            />

            {categories.map((category) => (
              <FilterRow
                key={category.id}
                label={category.nombre}
                checked={selectedCategoryId === category.id}
                count={categoryCounts[category.id] ?? 0}
                onClick={() => onCategoryChange(category.id)}
              />
            ))}
          </div>
        </div>

        <div className="border-t border-[#E5EAF3]" />

        <div className="rounded-[20px] bg-[#F8FAFC] px-4 py-4 text-sm text-[#64748B]">
          <span className="font-semibold text-[#0F172A]">{resultsCount}</span>{" "}
          resultados encontrados
        </div>
      </div>
    </section>
  );
}

function FilterRow({
  label,
  checked,
  count,
  onClick,
}: {
  label: string;
  checked: boolean;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-12 w-full items-center gap-3 rounded-2xl border px-4 text-left transition ${
        checked
          ? "border-[#BFDBFE] bg-[#EEF4FF]"
          : "border-[#E5EAF3] bg-white hover:bg-[#F8FAFC]"
      }`}
    >
      <span
        aria-hidden="true"
        className={`inline-flex h-5 w-5 items-center justify-center rounded-full border transition ${
          checked
            ? "border-[#2563EB] bg-[#2563EB]"
            : "border-[#CBD5E1] bg-white"
        }`}
      >
        {checked ? (
          <span className="h-2.5 w-2.5 rounded-full bg-white" />
        ) : null}
      </span>

      <span className="min-w-0 flex-1 truncate text-sm font-medium text-[#0F172A]">
        {label}
      </span>

      <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-[#E2E8F0] px-2.5 py-1 text-[11px] font-semibold text-[#475569]">
        {count}
      </span>
    </button>
  );
}
