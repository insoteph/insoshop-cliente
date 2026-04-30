"use client";

import { SearchBar } from "@/modules/core/components/SearchBar";
import {
  ToolbarActions,
  type DataTableToolbarAction,
} from "@/modules/core/components/DataTableToolbar";

type CategoriesToolbarProps = {
  search: string;
  statusFilter: "activos" | "inactivos" | "todos";
  canManage: boolean;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: "activos" | "inactivos" | "todos") => void;
  onCreateClick: () => void;
};

export function CategoriesToolbar({
  search,
  statusFilter,
  canManage,
  onSearchChange,
  onStatusFilterChange,
  onCreateClick,
}: CategoriesToolbarProps) {
  const actions: DataTableToolbarAction[] = canManage
    ? [
        {
          label: "Nueva categoria",
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
            placeholder="Buscar por nombre de categoria"
            ariaLabel="Buscar categorias"
          />
        </div>
        <ToolbarActions actions={actions} className="shrink-0" />
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
          <option value="activos">Solo activas</option>
          <option value="inactivos">Solo inactivas</option>
        </select>
      </div>
    </div>
  );
}

