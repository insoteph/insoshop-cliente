"use client";

type DataTableEmptyStateProps = {
  message: string;
  className?: string;
};

export function DataTableEmptyState({
  message,
  className = "",
}: DataTableEmptyStateProps) {
  return (
    <div
      className={`rounded-2xl border border-dashed border-[var(--line)] bg-[var(--panel)] px-4 py-8 text-center text-sm text-[var(--muted)] ${className}`}
    >
      {message}
    </div>
  );
}
