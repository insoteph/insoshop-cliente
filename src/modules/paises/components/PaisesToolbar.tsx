"use client";

import { SearchBar } from "@/modules/core/components/SearchBar";
import type { PaisStatusFilter } from "@/modules/paises/types/paises-types";

type PaisesToolbarProps = {
  search: string;
  statusFilter: PaisStatusFilter;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: PaisStatusFilter) => void;
  onCreateClick: () => void;
};

export function PaisesToolbar({
  search,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  onCreateClick,
}: PaisesToolbarProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-[var(--line)] bg-[color:var(--panel-strong)] px-4 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.07)] md:px-5 md:py-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground-strong)] md:text-[2rem]">
            Paises
          </h1>
          <p className="max-w-2xl text-sm font-semibold leading-6 text-[var(--muted)] md:text-[0.95rem]">
            Administra el catalogo de paises, codigos telefonicos y monedas.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateClick}
          className="app-button-primary inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium md:self-start"
        >
          <span
            aria-hidden="true"
            className="h-4 w-4 shrink-0 bg-current"
            style={{
              WebkitMaskImage: "url(/icons/plus.svg)",
              maskImage: "url(/icons/plus.svg)",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskPosition: "center",
              WebkitMaskSize: "contain",
              maskSize: "contain",
            }}
          />
          <span>Nuevo pais</span>
        </button>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
        <SearchBar
          value={search}
          onChange={onSearchChange}
          placeholder="Buscar por nombre, codigo o moneda"
        />

        <select
          value={statusFilter}
          onChange={(event) =>
            onStatusFilterChange(event.target.value as PaisStatusFilter)
          }
          className="app-input h-12 rounded-xl px-3 text-sm"
        >
          <option value="todos">Todos</option>
          <option value="activos">Activos</option>
          <option value="inactivos">Inactivos</option>
        </select>
      </div>
    </div>
  );
}
