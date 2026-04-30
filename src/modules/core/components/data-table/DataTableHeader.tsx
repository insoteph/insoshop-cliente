"use client";

import type { DataTableColumn, DataTableRowActionsConfig } from "./DataTableTypes";
import { getStableKeyPart } from "./DataTableHelpers";

type DataTableHeaderProps<TData extends Record<string, unknown>> = {
  headers: Array<DataTableColumn<TData>>;
  rowActions?: DataTableRowActionsConfig<TData>;
};

export function DataTableHeader<TData extends Record<string, unknown>>({
  headers,
  rowActions,
}: DataTableHeaderProps<TData>) {
  return (
    <thead className="bg-[var(--panel-muted)]">
      <tr>
        {headers.map((column) => (
          <th
            key={getStableKeyPart(column.key)}
            className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted)] ${
              column.headerClassName ?? ""
            }`}
          >
            {column.header}
          </th>
        ))}

        {rowActions ? (
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            {rowActions.headerLabel ?? "Acciones"}
          </th>
        ) : null}
      </tr>
    </thead>
  );
}
