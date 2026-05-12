"use client";

import { AppButton } from "@/modules/core/components/AppButton";
import { SearchBar } from "@/modules/core/components/SearchBar";

type ProductsToolbarProps = {
  title?: string;
  subtitle?: string;
  search: string;
  onSearchChange: (value: string) => void;
  error: string | null;
  canCreateProducts: boolean;
  onCreateClick: () => void;
};

export function ProductsToolbar({
  title = "Productos",
  subtitle = "Gestiona tu catálogo, sus opciones y sus combinaciones de venta.",
  search,
  onSearchChange,
  error,
  canCreateProducts,
  onCreateClick,
}: ProductsToolbarProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <h1 className="text-[15px] font-semibold tracking-tight text-[var(--foreground-strong)] sm:text-base md:text-lg">
          {title}
        </h1>
        <p className="max-w-2xl text-[13px] font-normal leading-6 text-[var(--muted)] sm:text-sm">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <SearchBar
            value={search}
            onChange={onSearchChange}
            placeholder="Buscar por nombre o descripción del producto"
            ariaLabel="Buscar productos"
          />
        </div>

        {canCreateProducts ? (
          <AppButton iconPath="/icons/plus-circle.svg" onClick={onCreateClick}>
            Nuevo producto
          </AppButton>
        ) : null}
      </div>

      {error ? <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">{error}</p> : null}
    </div>
  );
}
