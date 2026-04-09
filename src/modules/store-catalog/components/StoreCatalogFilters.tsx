"use client";

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
    <section className="space-y-6 rounded-[28px] border border-[#e9ebf5] bg-white p-5 shadow-[0_16px_36px_rgba(32,40,84,0.06)]">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8188a3]">
              Categoria
            </p>
            <h2 className="mt-1 text-lg font-semibold text-[#191b2a]">
              Filtrar catalogo
            </h2>
          </div>
          <span className="rounded-full bg-[#f2f4fb] px-2.5 py-1 text-[11px] font-semibold text-[#66708f]">
            {categories.length + 1}
          </span>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8188a3]">
            Categorias
          </p>
          <button
            type="button"
            onClick={() => onCategoryChange(null)}
            className={`flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left text-sm font-medium transition ${
              selectedCategoryId === null
                ? "bg-[#f1edff] text-[#5f34ea]"
                : "text-[#3c435e] hover:bg-[#f5f7fd]"
            }`}
          >
            <span>Todas</span>
            <span className="text-xs text-[#8a91ac]">Ver todo</span>
          </button>

          <div className="max-h-[420px] space-y-1 overflow-y-auto pr-1">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => onCategoryChange(category.id)}
                className={`flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left text-sm font-medium transition ${
                  selectedCategoryId === category.id
                    ? "bg-[#f1edff] text-[#5f34ea]"
                    : "text-[#3c435e] hover:bg-[#f5f7fd]"
                }`}
              >
                <span className="line-clamp-1">{category.nombre}</span>
                <span className="text-xs text-[#9aa1ba]">
                  {selectedCategoryId === category.id ? "Activo" : ""}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 rounded-[22px] bg-[#f7f8fc] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8188a3]">
            Estado
          </p>
          <p className="text-sm text-[#505773]">
            {search.trim()
              ? `Busqueda actual: ${search.trim()}`
              : "Sin termino de busqueda"}
          </p>
          {(selectedCategoryId !== null || search.trim()) && (
            <button
              type="button"
              onClick={() => {
                if (search.trim()) {
                  onSearchChange("");
                }
                onCategoryChange(null);
              }}
              className="mt-2 w-full rounded-2xl bg-[#6d38ff] px-4 py-2.5 text-sm font-semibold text-white"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
