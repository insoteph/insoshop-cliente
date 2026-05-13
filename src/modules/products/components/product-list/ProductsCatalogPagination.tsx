"use client";

type ProductsCatalogPaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function ProductsCatalogPagination({
  page,
  totalPages,
  onPageChange,
}: ProductsCatalogPaginationProps) {
  const resolvedTotalPages = Math.max(totalPages, 1);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--panel-strong)] px-4 py-2.5 text-[13px] font-semibold text-[var(--foreground)] transition hover:border-[var(--line-strong)] hover:bg-[var(--panel-muted)] disabled:cursor-not-allowed disabled:opacity-45"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        <span
          aria-hidden="true"
          className="h-4 w-4 bg-current"
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

      <span className="hidden text-[13px] text-[var(--muted)] sm:inline">
        Página {page} de {resolvedTotalPages}
      </span>

      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--panel-strong)] px-4 py-2.5 text-[13px] font-semibold text-[var(--foreground)] transition hover:border-[var(--line-strong)] hover:bg-[var(--panel-muted)] disabled:cursor-not-allowed disabled:opacity-45"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        Siguiente
        <span
          aria-hidden="true"
          className="h-4 w-4 bg-current"
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
  );
}
