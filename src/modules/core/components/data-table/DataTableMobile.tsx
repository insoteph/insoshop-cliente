"use client";

import { DataTableEmptyState } from "./DataTableEmptyState";
import { DataTableSkeleton } from "./DataTableSkeleton";
import {
  getRowKey,
  getVisibleDropdownOptions,
  resolvePrimaryButtonLabel,
} from "./DataTableHelpers";
import type {
  DataTableColumn,
  DataTableRowActionsConfig,
} from "./DataTableTypes";
import { renderMobileSummaryValue } from "./DataTableRenderers";
import { TableRowActions } from "@/modules/core/components/TableRowActions";

type DataTableMobileProps<TData extends Record<string, unknown>> = {
  headers: Array<DataTableColumn<TData>>;
  rows: TData[];
  rowKey?: keyof TData | ((row: TData, rowIndex: number) => string | number);
  rowActions?: DataTableRowActionsConfig<TData>;
  showSkeleton: boolean;
  skeletonRows: number;
  emptyMessage: string;
};

export function DataTableMobile<TData extends Record<string, unknown>>({
  headers,
  rows,
  rowKey,
  rowActions,
  showSkeleton,
  skeletonRows,
  emptyMessage,
}: DataTableMobileProps<TData>) {
  const mobileSummaryColumns = headers.slice(0, Math.min(2, headers.length));

  return (
    <div className="space-y-3 px-4 py-4 md:hidden">
      {showSkeleton ? (
        <DataTableSkeleton
          variant="mobile"
          rows={skeletonRows}
          columns={mobileSummaryColumns.length}
          summaryColumns={mobileSummaryColumns.length}
        />
      ) : rows.length > 0 ? (
        rows.map((row, rowIndex) => {
          const computedRowKey = getRowKey(row, rowIndex, rowKey);
          const mobileRowKey = String(computedRowKey);
          const visibleDropdownOptions = getVisibleDropdownOptions(
            row,
            rowActions,
          );

          return (
            <article
              key={`mobile-${mobileRowKey}`}
              className={`overflow-hidden rounded-[22px] border border-[var(--line)] bg-[var(--panel)] shadow-sm ${
                rowActions
                  ? "transition hover:border-[var(--line-strong)] hover:shadow-md"
                  : ""
              }`}
            >
              <div
                role={rowActions ? "button" : undefined}
                tabIndex={rowActions ? 0 : undefined}
                onClick={() => {
                  if (!rowActions) {
                    return;
                  }

                  rowActions.onPrimaryAction(row);
                }}
                onKeyDown={(event) => {
                  if (!rowActions) {
                    return;
                  }

                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    rowActions.onPrimaryAction(row);
                  }
                }}
                className={`block w-full text-left ${
                  rowActions ? "cursor-pointer" : ""
                }`}
              >
                <div className="space-y-3 px-4 py-4">
                  {mobileSummaryColumns.map((column, columnIndex) => (
                    <div
                      key={`${mobileRowKey}-${String(column.key)}`}
                      className={`flex gap-3 ${columnIndex === 0 ? "items-start" : "items-center"}`}
                    >
                      <span className="min-w-0 flex-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                        {column.header}
                      </span>
                      <span
                        className={`min-w-0 text-right text-sm text-[var(--foreground)] ${
                          columnIndex === 0 ? "font-semibold" : ""
                        }`}
                      >
                        {renderMobileSummaryValue(row, column)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-[var(--line)] px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-[var(--muted)]">
                    {rowActions
                      ? "Toca la tarjeta para ejecutar la acción principal."
                      : "Sin acciones disponibles."}
                  </p>
                  {rowActions ? (
                    <TableRowActions
                      primaryButtonLabel={resolvePrimaryButtonLabel(row, rowActions)}
                      onPrimaryAction={() => rowActions.onPrimaryAction(row)}
                      dropdownOptions={visibleDropdownOptions}
                    />
                  ) : null}
                </div>
              </div>
            </article>
          );
        })
      ) : (
        <DataTableEmptyState message={emptyMessage} />
      )}
    </div>
  );
}
