"use client";

import { TableRowActions } from "@/modules/core/components/TableRowActions";

import {
  getColumnLayout,
  getRowKey,
  getVisibleDropdownOptions,
  resolveColumnValue,
  resolvePrimaryButtonLabel,
} from "./DataTableHelpers";
import { DataTableSkeleton } from "./DataTableSkeleton";
import type {
  DataTableBadgeConfig,
  DataTableColumn,
  DataTableRowActionsConfig,
} from "./DataTableTypes";
import { renderDesktopColumnContent } from "./DataTableRenderers";
import { DataTableEmptyState } from "./DataTableEmptyState";
import { renderHeroImageCell } from "./DataTableImage";

type DataTableDesktopProps<TData extends Record<string, unknown>> = {
  headers: Array<DataTableColumn<TData>>;
  rows: TData[];
  rowKey?: keyof TData | ((row: TData, rowIndex: number) => string | number);
  badges: Array<DataTableBadgeConfig<TData>>;
  rowActions?: DataTableRowActionsConfig<TData>;
  onRowClick?: (row: TData) => void;
  showSkeleton: boolean;
  showRefreshingState: boolean;
  skeletonRows: number;
  emptyMessage: string;
};

export function DataTableDesktop<TData extends Record<string, unknown>>({
  headers,
  rows,
  rowKey,
  badges,
  rowActions,
  onRowClick,
  showSkeleton,
  showRefreshingState,
  skeletonRows,
  emptyMessage,
}: DataTableDesktopProps<TData>) {
  const { imageColumn, contentColumns } = getColumnLayout(headers);

  return (
    <div className="hidden md:block px-4 pt-4">
      {showSkeleton ? (
        <div
          className={`space-y-3 transition-opacity ${
            showRefreshingState ? "opacity-70" : "opacity-100"
          }`}
        >
          <DataTableSkeleton
            variant="desktop"
            rows={skeletonRows}
            summaryColumns={contentColumns.length}
            hasImage={Boolean(imageColumn)}
          />
        </div>
      ) : rows.length > 0 ? (
        <div
          className={`space-y-3 transition-opacity ${
            showRefreshingState ? "opacity-70" : "opacity-100"
          }`}
        >
          {rows.map((row, rowIndex) => {
            const computedRowKey = getRowKey(row, rowIndex, rowKey);
            const computedRowKeyText = String(computedRowKey);
            const visibleDropdownOptions =
              getVisibleDropdownOptions(row, rowActions);

            return (
              <article
                key={computedRowKeyText}
                className={`overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel)] transition ${
                  onRowClick ? "cursor-pointer hover:border-[var(--line-strong)]" : "hover:border-[var(--line-strong)]"
                }`}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={
                  onRowClick
                    ? (event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onRowClick(row);
                        }
                      }
                    : undefined
                }
                role={onRowClick ? "button" : undefined}
                tabIndex={onRowClick ? 0 : undefined}
              >
                <div className="flex min-w-max items-center gap-3 overflow-x-auto px-3.5 py-3">
                  {imageColumn ? (
                    <div className="shrink-0">
                      {renderHeroImageCell(
                        row,
                        resolveColumnValue(row, imageColumn.key),
                        imageColumn.desktopImageConfig ?? imageColumn.imageConfig,
                      )}
                    </div>
                  ) : null}

                  <div className="min-w-max flex-1">
                    <div className="flex min-w-max items-center gap-3">
                      {contentColumns.map((column) => (
                        <div
                          key={`${computedRowKeyText}-${String(column.key)}`}
                          className="w-[8.5rem] min-w-[8.5rem] max-w-[8.5rem] shrink-0 rounded-md bg-transparent px-0 py-0"
                        >
                          <div className="flex items-center gap-0.5">
                            {column.headerIconPath ? (
                              <span
                                aria-hidden="true"
                                className="h-3 w-3 shrink-0 text-[color-mix(in_srgb,var(--accent)_50%,white)]"
                                style={{
                                  WebkitMaskImage: `url(${column.headerIconPath})`,
                                  maskImage: `url(${column.headerIconPath})`,
                                  WebkitMaskRepeat: "no-repeat",
                                  maskRepeat: "no-repeat",
                                  WebkitMaskPosition: "center",
                                  maskPosition: "center",
                                  WebkitMaskSize: "contain",
                                  maskSize: "contain",
                                  backgroundColor: "currentColor",
                                }}
                              />
                            ) : null}
                            <p className="truncate text-[11px] font-medium text-[var(--muted)]">
                              {column.header}
                            </p>
                          </div>
                          <div
                            className={`mt-0.5 truncate text-[0.82rem] text-[var(--foreground)] ${
                              column.className ?? ""
                            }`}
                          >
                            {renderDesktopColumnContent(row, column, badges)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {rowActions ? (
                    <div
                      className="shrink-0 self-center"
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
          })}
        </div>
      ) : (
        <div className="py-3">
          <DataTableEmptyState message={emptyMessage} />
        </div>
      )}
    </div>
  );
}
