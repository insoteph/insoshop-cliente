"use client";

type DataTableSkeletonProps = {
  variant: "mobile" | "desktop";
  rows: number;
  summaryColumns?: number;
  hasImage?: boolean;
};

export function DataTableSkeleton({
  variant,
  rows,
  summaryColumns = 2,
  hasImage = false,
}: DataTableSkeletonProps) {
  if (variant === "mobile") {
    return (
      <>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <article
            key={`mobile-skeleton-${rowIndex}`}
            className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-3.5 shadow-sm md:rounded-2xl md:p-4"
          >
            <div className="space-y-3">
              {Array.from({ length: Math.max(summaryColumns, 2) }).map(
                (_, lineIndex) => (
                  <div
                    key={`mobile-skeleton-${rowIndex}-${lineIndex}`}
                    className="space-y-2"
                  >
                    <span className="block h-3 w-24 animate-pulse rounded bg-[var(--panel-muted)]" />
                    <span className="block h-4 w-full animate-pulse rounded bg-[var(--panel-muted)]" />
                  </div>
                ),
              )}
            </div>
          </article>
        ))}
      </>
    );
  }

  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <article
          key={`desktop-skeleton-${rowIndex}`}
          className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4"
        >
          <div className="flex items-center gap-3">
            {hasImage ? (
              <span className="data-table-skeleton block h-12 w-12 animate-pulse rounded-xl" />
            ) : null}

            <div className="min-w-0 flex-1 space-y-2">
              {Array.from({ length: Math.max(summaryColumns, 2) }).map(
                (_, lineIndex) => (
                  <span
                    key={`desktop-skeleton-${rowIndex}-${lineIndex}`}
                    className={`data-table-skeleton block h-4 animate-pulse rounded ${
                      lineIndex === 0 ? "w-3/5 max-w-[14rem]" : "w-2/5 max-w-[10rem]"
                    }`}
                    aria-hidden="true"
                  />
                ),
              )}
            </div>
          </div>
        </article>
      ))}
    </>
  );
}
