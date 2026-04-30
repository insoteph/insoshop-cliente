"use client";

type DataTableSkeletonProps = {
  variant: "mobile" | "desktop";
  rows: number;
  columns: number;
  summaryColumns?: number;
};

export function DataTableSkeleton({
  variant,
  rows,
  columns,
  summaryColumns = 2,
}: DataTableSkeletonProps) {
  if (variant === "mobile") {
    return (
      <>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <article
            key={`mobile-skeleton-${rowIndex}`}
            className="rounded-[22px] border border-[var(--line)] bg-[var(--panel)] p-4 shadow-sm"
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
        <tr key={`skeleton-${rowIndex}`}>
          {Array.from({ length: columns }).map((__, cellIndex) => (
            <td key={`skeleton-${rowIndex}-${cellIndex}`} className="px-4 py-3">
              <span
                className="data-table-skeleton block h-4 w-full max-w-[12rem] animate-pulse rounded"
                aria-hidden="true"
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
