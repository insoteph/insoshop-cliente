"use client";

import { SearchBar } from "@/modules/core/components/SearchBar";
import {
  ToolbarActions,
  type DataTableToolbarAction,
} from "@/modules/core/components/DataTableToolbar";

type ProductsToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: "activos" | "inactivos" | "todos";
  onStatusFilterChange: (value: "activos" | "inactivos" | "todos") => void;
  error: string | null;
  canCreateProducts: boolean;
  onCreateClick: () => void;
};

export function ProductsToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  error,
  canCreateProducts,
  onCreateClick,
}: ProductsToolbarProps) {
  const toolbarActions: DataTableToolbarAction[] = canCreateProducts
    ? [
        {
          label: "Nuevo producto",
          iconPath: "/icons/plus.svg",
          onClick: onCreateClick,
        },
      ]
    : [];

  return (
    <div className="space-y-4 rounded-md border border-[var(--line)] bg-[var(--panel)] p-5 shadow-md">
      <div className="flex flex-row items-center gap-2">
        <div className="min-w-0 flex-1">
          <SearchBar
            value={search}
            onChange={onSearchChange}
            placeholder="Buscar por nombre o descripción del producto"
            ariaLabel="Buscar productos"
          />
        </div>
        <ToolbarActions actions={toolbarActions} className="shrink-0" />
      </div>

      <div className="grid gap-3 md:grid-cols-[220px] md:justify-end">
        <select
          value={statusFilter}
          onChange={(event) =>
            onStatusFilterChange(
              event.target.value as "activos" | "inactivos" | "todos",
            )
          }
          className="app-input rounded-2xl px-4 py-3 text-sm"
        >
          <option value="todos">Todos los estados</option>
          <option value="activos">Solo activos</option>
          <option value="inactivos">Solo inactivos</option>
        </select>
      </div>

      {error ? <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">{error}</p> : null}
    </div>
  );
}
