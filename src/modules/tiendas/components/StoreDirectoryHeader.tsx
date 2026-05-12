"use client";

import { AppButton } from "@/modules/core/components/AppButton";
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
    <div className="space-y-4 px-0 py-0">
      <div className="space-y-1.5">
        <h1 className="text-[15px] font-semibold tracking-tight text-[var(--foreground-strong)] sm:text-base md:text-lg">
          Tiendas
        </h1>
        <p className="max-w-2xl text-[13px] font-normal leading-6 text-[var(--muted)] sm:text-sm">
          Gestiona y administra las tiendas de Insoshop.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <SearchBar
            value={searchTerm}
            onChange={onSearchTermChange}
            placeholder="Buscar por nombre, slug, telefono o codigo de moneda"
          />
        </div>

        <AppButton
          iconPath="/icons/plus-circle.svg"
          onClick={onNewStore}
          className="shrink-0"
          aria-label="Nueva Tienda"
        >
          Nueva Tienda
        </AppButton>
      </div>
    </div>
  );
}
