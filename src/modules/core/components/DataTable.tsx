type DataTableColumn<TData extends Record<string, unknown>> = {
  key: keyof TData;
  header: string;
};

type DataTableProps<TData extends Record<string, unknown>> = {
  headers: Array<DataTableColumn<TData>>;
  data: TData[];
  isLoading?: boolean;
  skeletonRows?: number;
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

export function DataTable<TData extends Record<string, unknown>>({
  headers,
  data,
  isLoading = false,
  skeletonRows = 6,
}: DataTableProps<TData>) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel)]">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--line)]">
          <thead className="bg-[var(--panel-muted)]">
            <tr>
              {headers.map((column) => (
                <th
                  key={String(column.key)}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted)]"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--line)]">
            {isLoading ? (
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
                <tr key={rowIndex} className="hover:bg-[var(--panel-muted)]/70">
                  {headers.map((column) => (
                    <td
                      key={`${rowIndex}-${String(column.key)}`}
                      className="px-4 py-3 text-sm text-[var(--foreground)]"
                    >
                      {formatCellValue(row[column.key])}
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
                  No hay datos para mostrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
