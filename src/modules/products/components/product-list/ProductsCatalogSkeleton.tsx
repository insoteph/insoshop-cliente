"use client";

type ProductsCatalogSkeletonProps = {
  rows?: number;
};

export function ProductsCatalogSkeleton({ rows = 4 }: ProductsCatalogSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <article
          key={`product-skeleton-${rowIndex}`}
          className="overflow-hidden rounded-[28px] border border-[var(--line)] bg-[var(--panel)] p-4 sm:p-5"
        >
          <div className="grid grid-cols-[88px_minmax(0,1fr)_auto] gap-3 sm:grid-cols-[104px_minmax(0,1fr)_auto] sm:gap-4 md:grid-cols-[112px_minmax(0,1fr)_auto]">
            <div className="h-[108px] w-[88px] rounded-[18px] bg-[var(--panel-muted)] animate-pulse sm:h-[124px] sm:w-[104px] md:h-[136px] md:w-[112px]" />

            <div className="min-w-0 self-center space-y-3">
              <span className="block h-5 w-3/5 animate-pulse rounded-full bg-[var(--panel-muted)]" />
              <span className="block h-4 w-1/4 animate-pulse rounded-full bg-[var(--panel-muted)]" />
              <span className="block h-4 w-2/5 animate-pulse rounded-full bg-[var(--panel-muted)]" />
              <span className="block h-4 w-1/2 animate-pulse rounded-full bg-[var(--panel-muted)]" />
            </div>

            <div className="flex items-center justify-end self-center">
              <span className="h-11 w-28 animate-pulse rounded-xl bg-[var(--panel-muted)]" />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
