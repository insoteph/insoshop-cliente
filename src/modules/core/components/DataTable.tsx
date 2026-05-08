"use client";

import { DataTableDesktop } from "./data-table/DataTableDesktop";
import { DataTableFooter } from "./data-table/DataTableFooter";
import { DataTableMobile } from "./data-table/DataTableMobile";
import type { DataTableProps } from "./data-table/DataTableTypes";

export type {
  DataTableBadgeConfig,
  DataTableColumn,
  DataTableImageConfig,
  DataTablePaginationConfig,
  DataTableProps,
  DataTableRowActionsConfig,
} from "./data-table/DataTableTypes";

export function DataTable<TData extends Record<string, unknown>>({
  headers,
  rows,
  data,
  isLoading = false,
  skeletonRows = 6,
  rowKey,
  emptyMessage = "No hay datos para mostrar.",
  badges = [],
  rowActions,
  pagination,
}: DataTableProps<TData>) {
  const resolvedRows = rows ?? data ?? [];
  const showSkeleton = isLoading && resolvedRows.length === 0;
  const showRefreshingState = isLoading && resolvedRows.length > 0;
  const displayedRecords = resolvedRows.length;
  const totalRecords = pagination.totalRecords ?? displayedRecords;

  return (
    <div className="relative">
      {showRefreshingState ? (
        <div className="data-table-refresh-indicator" aria-live="polite">
          Actualizando resultados...
        </div>
      ) : null}

      <DataTableMobile
        headers={headers}
        rows={resolvedRows}
        rowKey={rowKey}
        badges={badges}
        rowActions={rowActions}
        showSkeleton={showSkeleton}
        skeletonRows={skeletonRows}
        emptyMessage={emptyMessage}
      />

      <DataTableDesktop
        headers={headers}
        rows={resolvedRows}
        rowKey={rowKey}
        badges={badges}
        rowActions={rowActions}
        showSkeleton={showSkeleton}
        showRefreshingState={showRefreshingState}
        skeletonRows={skeletonRows}
        emptyMessage={emptyMessage}
      />

      <DataTableFooter
        displayedRecords={displayedRecords}
        totalRecords={totalRecords}
        pagination={pagination}
      />
    </div>
  );
}
