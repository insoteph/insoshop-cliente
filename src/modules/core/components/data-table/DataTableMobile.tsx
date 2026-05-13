"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import { DataTableEmptyState } from "./DataTableEmptyState";
import { DataTableMobileDetailModal } from "@/modules/core/components/DataTableMobileDetailModal";
import { DataTableSkeleton } from "./DataTableSkeleton";
import {
  getColumnLayout,
  getRowKey,
  getVisibleDropdownOptions,
  resolvePrimaryButtonLabel,
  resolveColumnValue,
  summarizeValue,
} from "./DataTableHelpers";
import type {
  DataTableBadgeConfig,
  DataTableColumn,
  DataTableRowActionsConfig,
} from "./DataTableTypes";
import {
  renderDesktopColumnContent,
  renderMobileSummaryValue,
} from "./DataTableRenderers";
import { TableRowActions } from "@/modules/core/components/TableRowActions";

type DataTableMobileProps<TData extends Record<string, unknown>> = {
  headers: Array<DataTableColumn<TData>>;
  rows: TData[];
  rowKey?: keyof TData | ((row: TData, rowIndex: number) => string | number);
  badges: Array<DataTableBadgeConfig<TData>>;
  rowActions?: DataTableRowActionsConfig<TData>;
  showSkeleton: boolean;
  skeletonRows: number;
  emptyMessage: string;
};

export function DataTableMobile<TData extends Record<string, unknown>>({
  headers,
  rows,
  rowKey,
  badges,
  rowActions,
  showSkeleton,
  skeletonRows,
  emptyMessage,
}: DataTableMobileProps<TData>) {
  const [activeRow, setActiveRow] = useState<TData | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const closeDetailTimeoutRef = useRef<number | null>(null);

  const { imageColumn, summaryColumns } = getColumnLayout(headers);

  const clearCloseTimeout = useCallback(() => {
    if (closeDetailTimeoutRef.current) {
      window.clearTimeout(closeDetailTimeoutRef.current);
      closeDetailTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearCloseTimeout();
    };
  }, [clearCloseTimeout]);

  function openDetail(row: TData) {
    clearCloseTimeout();
    setActiveRow(row);
    setIsDetailOpen(true);
  }

  function closeDetail() {
    setIsDetailOpen(false);
    clearCloseTimeout();
    closeDetailTimeoutRef.current = window.setTimeout(() => {
      setActiveRow(null);
    }, 240);
  }

  const detailTitle = useMemo(() => {
    if (!activeRow) {
      return "Detalle del registro";
    }

    const titleColumn = summaryColumns[0] ?? imageColumn ?? headers[0];
    if (!titleColumn) {
      return "Detalle del registro";
    }

    if (titleColumn.dataType === "image") {
      return titleColumn.header;
    }

    const rawValue = resolveColumnValue(activeRow, titleColumn.key);
    const summary = summarizeValue(rawValue);
    return summary !== "-" ? summary : titleColumn.header;
  }, [activeRow, headers, imageColumn, summaryColumns]);

  const detailItems = useMemo(() => {
    if (!activeRow) {
      return [];
    }

    return headers.map((column) => ({
      label: column.header,
      value: renderDesktopColumnContent(activeRow, column, badges),
    }));
  }, [activeRow, badges, headers]);

  return (
    <div className="space-y-2 px-2.5 py-2 md:hidden">
      {showSkeleton ? (
        <DataTableSkeleton
          variant="mobile"
          rows={skeletonRows}
          summaryColumns={summaryColumns.length}
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
              className={`overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel)] md:rounded-2xl ${
                rowActions ? "transition hover:border-[var(--line-strong)]" : ""
              }`}
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => openDetail(row)}
                onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openDetail(row);
                  }
                }}
                className="flex w-full items-center gap-2 px-2 py-1.5 text-left"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-2">
                    {imageColumn ? (
                      <div className="shrink-0 scale-[0.92]">
                        {renderMobileSummaryValue(row, imageColumn, badges)}
                      </div>
                    ) : null}

                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-1.5 overflow-hidden">
                        {summaryColumns.map((column, columnIndex) => (
                          <span
                            key={`${mobileRowKey}-${String(column.key)}`}
                            className={`min-w-0 truncate text-[0.8rem] ${
                              columnIndex === 0
                                ? "font-semibold text-[var(--foreground-strong)]"
                              : "text-[var(--muted)]"
                            }`}
                          >
                            {renderMobileSummaryValue(row, column, badges)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {rowActions ? (
                  <div
                    className="shrink-0"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <TableRowActions
                      primaryButtonLabel={resolvePrimaryButtonLabel(
                        row,
                        rowActions,
                      )}
                      primaryButtonIconPath={rowActions.primaryButtonIconPath}
                      onPrimaryAction={() => rowActions.onPrimaryAction(row)}
                      dropdownOptions={visibleDropdownOptions}
                    />
                  </div>
                ) : null}
              </div>
            </article>
          );
        })
      ) : (
        <DataTableEmptyState message={emptyMessage} />
      )}

      {activeRow ? (
        <DataTableMobileDetailModal
          open={isDetailOpen}
          title={detailTitle}
          items={detailItems}
          onClose={closeDetail}
        />
      ) : null}
    </div>
  );
}
