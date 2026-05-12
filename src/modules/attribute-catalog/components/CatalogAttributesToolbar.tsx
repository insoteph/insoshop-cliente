"use client";

import { AppButton } from "@/modules/core/components/AppButton";
import { SearchBar } from "@/modules/core/components/SearchBar";
import type { CatalogAttributeStatusFilter } from "@/modules/attribute-catalog/types/catalog-attribute-form.types";

type CatalogAttributesToolbarProps = {
  search: string;
  statusFilter: CatalogAttributeStatusFilter;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: CatalogAttributeStatusFilter) => void;
  onCreateClick: () => void;
};

export function CatalogAttributesToolbar({
  search,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  onCreateClick,
}: CatalogAttributesToolbarProps) {
  return (
    <div className="space-y-4 rounded-md border border-[var(--line)] bg-[var(--panel)] p-5 shadow-md">
      <div className="flex flex-row items-center gap-2">
        <div className="min-w-0 flex-1">
          <SearchBar
            value={search}
            onChange={onSearchChange}
            placeholder="Buscar atributo de catálogo"
            ariaLabel="Buscar atributos de catálogo"
          />
        </div>
        <AppButton iconPath="/icons/plus-circle.svg" onClick={onCreateClick}>
          Nuevo atributo
        </AppButton>
      </div>

      <div className="grid gap-3 md:grid-cols-[220px] md:justify-end">
        <select
          value={statusFilter}
          onChange={(event) =>
            onStatusFilterChange(event.target.value as CatalogAttributeStatusFilter)
          }
          className="app-input rounded-2xl px-4 py-3 text-sm"
        >
          <option value="todos">Todos los estados</option>
          <option value="activos">Solo activos</option>
          <option value="inactivos">Solo inactivos</option>
        </select>
      </div>
    </div>
  );
}
