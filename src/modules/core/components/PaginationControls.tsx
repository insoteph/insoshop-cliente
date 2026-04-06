"use client";

type PaginationControlsProps = {
  page: number;
  totalPages: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
};

export function PaginationControls({
  page,
  totalPages,
  totalRecords,
  onPageChange,
}: PaginationControlsProps) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-[var(--line)] bg-[var(--panel)] px-5 py-4 md:flex-row md:items-center md:justify-between">
      <p className="text-sm text-[var(--muted)]">
        {totalRecords} registro{totalRecords === 1 ? "" : "s"} en total
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
        <span className="text-sm text-[var(--muted)]">
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
