"use client";

type PaginationControlsProps = {
  displayedRecords?: number;
  page: number;
  totalPages: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
};

export function PaginationControls({
  displayedRecords,
  page,
  totalPages,
  totalRecords,
  onPageChange,
}: PaginationControlsProps) {
  const visibleRecords = displayedRecords ?? totalRecords;

  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-[var(--line)] bg-[var(--panel)] px-5 py-4 md:flex-row md:items-center md:justify-between">
      <p className="text-sm text-[var(--muted)]">
        {visibleRecords} registro{visibleRecords === 1 ? "" : "s"}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-2xl border border-[var(--line)] px-4 py-2 text-sm font-medium text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-45"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          Anterior
        </button>
        <span className="hidden text-sm text-[var(--muted)] md:inline">
          Página {page} de {Math.max(totalPages, 1)}
        </span>
        <button
          type="button"
          className="rounded-2xl border border-[var(--line)] px-4 py-2 text-sm font-medium text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-45"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
