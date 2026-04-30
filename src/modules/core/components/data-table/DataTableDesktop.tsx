"use client";

import { Fragment } from "react";

import { TableRowActions } from "@/modules/core/components/TableRowActions";

import { getRowKey, getStableKeyPart, getVisibleDropdownOptions } from "./DataTableHelpers";
import { DataTableHeader } from "./DataTableHeader";
import { DataTableSkeleton } from "./DataTableSkeleton";
import type {
  DataTableBadgeConfig,
  DataTableColumn,
  DataTableRowActionsConfig,
} from "./DataTableTypes";
import { renderDesktopColumnContent } from "./DataTableRenderers";
import { DataTableEmptyState } from "./DataTableEmptyState";

type DataTableDesktopProps<TData extends Record<string, unknown>> = {
  headers: Array<DataTableColumn<TData>>;
  rows: TData[];
  rowKey?: keyof TData | ((row: TData, rowIndex: number) => string | number);
  badges: Array<DataTableBadgeConfig<TData>>;
  rowActions?: DataTableRowActionsConfig<TData>;
  showSkeleton: boolean;
  showRefreshingState: boolean;
  skeletonRows: number;
  totalColumns: number;
  emptyMessage: string;
};

export function DataTableDesktop<TData extends Record<string, unknown>>({
  headers,
  rows,
  rowKey,
  badges,
  rowActions,
  showSkeleton,
  showRefreshingState,
  skeletonRows,
  totalColumns,
  emptyMessage,
}: DataTableDesktopProps<TData>) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="min-w-full divide-y divide-[var(--line)]">
        <DataTableHeader headers={headers} rowActions={rowActions} />

        <tbody
          className={`divide-y divide-[var(--line)] transition-opacity ${
            showRefreshingState ? "opacity-70" : "opacity-100"
          }`}
        >
          {showSkeleton ? (
            <DataTableSkeleton
              variant="desktop"
              rows={skeletonRows}
              columns={totalColumns}
            />
          ) : rows.length > 0 ? (
            rows.map((row, rowIndex) => {
              const computedRowKey = getRowKey(row, rowIndex, rowKey);
              const computedRowKeyText = String(computedRowKey);
              const visibleDropdownOptions =
                getVisibleDropdownOptions(row, rowActions);

              return (
                <Fragment key={computedRowKeyText}>
                  <tr className="odd:bg-[var(--panel)] even:bg-[var(--panel-muted)]/70 hover:bg-[var(--panel-muted)]/85">
                    {headers.map((column) => (
                      <td
                        key={`${rowIndex}-${getStableKeyPart(column.key, rowIndex)}`}
                        className={`px-4 py-3 text-sm text-[var(--foreground)] ${
                          column.className ?? ""
                        }`}
                      >
                        {renderDesktopColumnContent(row, column, badges)}
                      </td>
                    ))}

                    {rowActions ? (
                      <td className="px-4 py-3 text-sm text-[var(--foreground)]">
                        <TableRowActions
                          primaryButtonLabel={
                            typeof rowActions.primaryButtonLabel === "function"
                              ? rowActions.primaryButtonLabel(row)
                              : rowActions.primaryButtonLabel
                          }
                          onPrimaryAction={() => rowActions.onPrimaryAction(row)}
                          dropdownOptions={visibleDropdownOptions}
                        />
                      </td>
                    ) : null}
                  </tr>
                </Fragment>
              );
            })
          ) : (
            <tr>
              <td colSpan={totalColumns} className="px-4 py-8">
                <DataTableEmptyState message={emptyMessage} />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
