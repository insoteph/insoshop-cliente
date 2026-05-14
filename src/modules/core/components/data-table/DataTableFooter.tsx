"use client";

import type { DataTablePaginationConfig } from "./DataTableTypes";

type DataTableFooterProps = {
  displayedRecords: number;
  pagination: DataTablePaginationConfig;
};

export function DataTableFooter({
  displayedRecords,
  pagination,
}: DataTableFooterProps) {
  return (
    <div className="mt-4 border-t border-[var(--line)] px-4 py-3 md:mt-5 md:px-5 md:py-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full items-center justify-center gap-3 md:w-auto md:justify-start">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--panel-strong)]">
            <span
              aria-hidden="true"
              className="h-5 w-5 bg-[var(--muted)] opacity-75"
              style={{
                WebkitMaskImage: "url(/icons/data.svg)",
                maskImage: "url(/icons/data.svg)",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
                WebkitMaskSize: "contain",
                maskSize: "contain",
              }}
            />
          </div>

          <div>
            <p className="text-[13px] font-semibold text-[var(--foreground-strong)]">
              Mostrando {displayedRecords} registro
              {displayedRecords === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 self-center md:self-auto">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm transition hover:border-[var(--line-strong)] hover:bg-[var(--background-soft)] disabled:cursor-not-allowed disabled:opacity-45 md:rounded-xl"
            onClick={() => pagination.onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            <span
              aria-hidden="true"
              className="h-4 w-4 shrink-0 bg-current"
              style={{
                WebkitMaskImage: "url(/icons/left.svg)",
                maskImage: "url(/icons/left.svg)",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
                WebkitMaskSize: "contain",
                maskSize: "contain",
              }}
            />
            Anterior
          </button>

          <span className="hidden items-center rounded-md border border-[var(--line)] bg-[var(--panel)] px-3.5 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm md:inline-flex md:rounded-xl">
            Pagina {pagination.page} de {Math.max(pagination.totalPages, 1)}
          </span>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm transition hover:border-[var(--line-strong)] hover:bg-[var(--background-soft)] disabled:cursor-not-allowed disabled:opacity-45 md:rounded-xl"
            onClick={() => pagination.onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            Siguiente
            <span
              aria-hidden="true"
              className="h-4 w-4 shrink-0 bg-current"
              style={{
                WebkitMaskImage: "url(/icons/right.svg)",
                maskImage: "url(/icons/right.svg)",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
                WebkitMaskSize: "contain",
                maskSize: "contain",
              }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
