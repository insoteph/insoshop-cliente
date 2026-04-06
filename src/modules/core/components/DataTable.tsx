import type { Key, ReactNode } from "react";

type DataTableColumn<TData extends Record<string, unknown>> = {
  key: keyof TData | string;
  header: string;
  render?: (row: TData) => ReactNode;
  className?: string;
  headerClassName?: string;
};

type DataTableProps<TData extends Record<string, unknown>> = {
  headers: Array<DataTableColumn<TData>>;
  data: TData[];
  isLoading?: boolean;
  skeletonRows?: number;
  rowKey?: keyof TData | ((row: TData, rowIndex: number) => Key);
  emptyMessage?: string;
};

function formatCellValue(value: unknown) {
  if (typeof value === "boolean") {
    return value ? "Sí" : "No";
  }

  if (value === null || value === undefined) {
    return "-";
  }

  return String(value);
}

function getRowKey<TData extends Record<string, unknown>>(
  row: TData,
  rowIndex: number,
  rowKey?: keyof TData | ((row: TData, rowIndex: number) => Key)
) {
  if (typeof rowKey === "function") {
    return rowKey(row, rowIndex);
  }

  if (rowKey) {
    return String(row[rowKey]);
  }

  return rowIndex;
}

export function DataTable<TData extends Record<string, unknown>>({
  headers,
  data,
  isLoading = false,
  skeletonRows = 6,
  rowKey,
  emptyMessage = "No hay datos para mostrar.",
}: DataTableProps<TData>) {
  const showSkeleton = isLoading && data.length === 0;
  const showRefreshingState = isLoading && data.length > 0;

  return (
    <div className="relative overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel)]">
      {showRefreshingState ? (
        <div className="data-table-refresh-indicator" aria-live="polite">
          Actualizando resultados...
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--line)]">
          <thead className="bg-[var(--panel-muted)]">
            <tr>
              {headers.map((column) => (
                <th
                  key={String(column.key)}
                  className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted)] ${column.headerClassName ?? ""}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody
            className={`divide-y divide-[var(--line)] transition-opacity ${
              showRefreshingState ? "opacity-70" : "opacity-100"
            }`}
          >
            {showSkeleton ? (
              Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`}>
                  {headers.map((column) => (
                    <td
                      key={`skeleton-${rowIndex}-${String(column.key)}`}
                      className="px-4 py-3"
                    >
                      <span
                        className="data-table-skeleton block h-4 w-full max-w-[12rem] animate-pulse rounded"
                        aria-hidden="true"
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr
                  key={getRowKey(row, rowIndex, rowKey)}
                  className="hover:bg-[var(--panel-muted)]/70"
                >
                  {headers.map((column) => (
                    <td
                      key={`${rowIndex}-${String(column.key)}`}
                      className={`px-4 py-3 text-sm text-[var(--foreground)] ${column.className ?? ""}`}
                    >
                      {column.render
                        ? column.render(row)
                        : formatCellValue(
                            (row as Record<string, unknown>)[String(column.key)]
                          )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-4 py-8 text-center text-sm text-[var(--muted)]"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
