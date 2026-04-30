"use client";

import type { DataTablePaginationConfig } from "./DataTableTypes";

type DataTableFooterProps = {
  displayedRecords: number;
  totalRecords: number;
  pagination: DataTablePaginationConfig;
};

export function DataTableFooter({
  displayedRecords,
  totalRecords,
  pagination,
}: DataTableFooterProps) {
  return (
    <div className="flex flex-col gap-3 border-t border-[var(--line)] px-4 py-3 md:flex-row md:items-center md:justify-between">
      <p className="text-sm text-[var(--foreground)]">
        Mostrando {displayedRecords} de {totalRecords} registro
        {totalRecords === 1 ? "" : "s"}
      </p>

      <div className="flex items-center gap-2 self-end md:self-auto">
        <button
          type="button"
          className="app-button-secondary rounded-2xl px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-45"
          onClick={() => pagination.onPageChange(pagination.page - 1)}
          disabled={pagination.page <= 1}
        >
          Anterior
        </button>

        <span className="text-sm text-[var(--foreground)]">
          Pagina {pagination.page} de {Math.max(pagination.totalPages, 1)}
        </span>

        <button
          type="button"
          className="app-button-secondary rounded-2xl px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-45"
          onClick={() => pagination.onPageChange(pagination.page + 1)}
          disabled={pagination.page >= pagination.totalPages}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
