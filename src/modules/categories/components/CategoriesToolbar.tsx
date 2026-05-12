"use client";

import { AppButton } from "@/modules/core/components/AppButton";
import { SearchBar } from "@/modules/core/components/SearchBar";

type CategoriesToolbarProps = {
  search: string;
  canManage: boolean;
  onSearchChange: (value: string) => void;
  onCreateClick: () => void;
};

export function CategoriesToolbar({
  search,
  canManage,
  onSearchChange,
  onCreateClick,
}: CategoriesToolbarProps) {
  return (
    <div className="flex flex-row items-center gap-2">
      <div className="min-w-0 flex-1">
        <SearchBar
          value={search}
          onChange={onSearchChange}
          placeholder="Buscar por nombre de categoria"
          ariaLabel="Buscar categorias"
        />
      </div>
      {canManage ? (
        <AppButton iconPath="/icons/plus-circle.svg" onClick={onCreateClick}>
          Nueva categoria
        </AppButton>
      ) : null}
    </div>
  );
}
