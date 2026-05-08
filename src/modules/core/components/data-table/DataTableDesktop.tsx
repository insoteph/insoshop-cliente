"use client";

import { TableRowActions } from "@/modules/core/components/TableRowActions";

import {
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
  showSkeleton,
  showRefreshingState,
  skeletonRows,
  emptyMessage,
}: DataTableDesktopProps<TData>) {
  const imageColumnIndex = headers.findIndex(
    (column) => column.dataType === "image",
  );
  const imageColumn =
    imageColumnIndex >= 0 ? headers[imageColumnIndex] : undefined;
  const contentColumns = headers.filter((_, index) => index !== imageColumnIndex);

  return (
    <div className="hidden md:block">
      {showSkeleton ? (
        <div
          className={`space-y-3 transition-opacity ${
            showRefreshingState ? "opacity-70" : "opacity-100"
          }`}
        >
          <DataTableSkeleton
            variant="desktop"
            rows={skeletonRows}
            columns={headers.length + (rowActions ? 1 : 0)}
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
                className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel)] shadow-[0_16px_38px_rgba(15,23,42,0.11)] transition hover:border-[var(--line-strong)] hover:shadow-[0_20px_46px_rgba(15,23,42,0.14)]"
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
                          className="min-w-[6.75rem] max-w-[9rem] rounded-md bg-transparent px-0 py-0"
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
                    <div className="shrink-0 self-center">
                      <TableRowActions
                        primaryButtonLabel={
                          typeof rowActions.primaryButtonLabel === "function"
                            ? rowActions.primaryButtonLabel(row)
                            : rowActions.primaryButtonLabel
                        }
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
