"use client";

import { SearchBar } from "@/modules/core/components/SearchBar";

type StoreDirectoryHeaderProps = {
  onNewStore: () => void;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
};

export function StoreDirectoryHeader({
  onNewStore,
  searchTerm,
  onSearchTermChange,
}: StoreDirectoryHeaderProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-[var(--line)] bg-[color:var(--panel-strong)] px-4 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.07)] md:px-5 md:py-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground-strong)] md:text-[2rem]">
            Tiendas
          </h1>
          <p className="max-w-2xl text-sm font-semibold leading-6 text-[var(--muted)] md:text-[0.95rem]">
            Gestiona y administra las tiendas de Insoshop.
          </p>
        </div>

        <button
          type="button"
          onClick={onNewStore}
          className="app-button-primary inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium md:self-start"
          aria-label="Nueva Tienda"
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
          <span>Nueva Tienda</span>
        </button>
      </div>

      <SearchBar
        value={searchTerm}
        onChange={onSearchTermChange}
        placeholder="Buscar por nombre, slug, telefono o moneda"
      />
    </div>
  );
}
