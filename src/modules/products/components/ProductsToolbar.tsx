"use client";

import { AppButton } from "@/modules/core/components/AppButton";
import { PanelSectionHeader } from "@/modules/core/components/PanelSectionHeader";
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
      <PanelSectionHeader
        title={title}
        subtitle={subtitle}
        headingLevel="h1"
      />

      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <SearchBar
            value={search}
            onChange={onSearchChange}
            placeholder="Buscar por nombre o SKU"
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
