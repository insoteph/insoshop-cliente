import type { Key, ReactNode } from "react";

import {
  DataTableBadge,
  type DataTableBadgeRule,
} from "@/modules/core/components/DataTableBadge";
import {
  TableRowActions,
  type DataTableRowActionOption,
} from "@/modules/core/components/TableRowActions";

type DataTableCellType = "text" | "image";

type DataTableImageConfig<TData extends Record<string, unknown>> = {
  alt: string | ((row: TData) => string);
  width?: number;
  height?: number;
  className?: string;
  fallbackText?: string;
};

export type DataTableColumn<TData extends Record<string, unknown>> = {
  key: keyof TData | string;
  header: string;
  dataType?: DataTableCellType;
  imageConfig?: DataTableImageConfig<TData>;
  render?: (row: TData) => ReactNode;
  textFormatter?: (value: unknown, row: TData) => ReactNode;
  className?: string;
  headerClassName?: string;
};

export type DataTableBadgeConfig<TData extends Record<string, unknown>> = {
  columnKey: keyof TData;
  rules: DataTableBadgeRule[];
};

export type DataTableRowActionsConfig<TData extends Record<string, unknown>> = {
  headerLabel?: string;
  primaryButtonLabel: string;
  onPrimaryAction: (row: TData) => void;
  dropdownOptions?: Array<{
    label: string | ((row: TData) => string);
    onClick: (row: TData) => void;
  }>;
};

export type DataTablePaginationConfig = {
  page: number;
  totalPages: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
};

type DataTableProps<TData extends Record<string, unknown>> = {
  headers: Array<DataTableColumn<TData>>;
  rows?: TData[];
  data?: TData[];
  isLoading?: boolean;
  skeletonRows?: number;
  rowKey?: keyof TData | ((row: TData, rowIndex: number) => Key);
  emptyMessage?: string;
  badges?: Array<DataTableBadgeConfig<TData>>;
  rowActions?: DataTableRowActionsConfig<TData>;
  pagination: DataTablePaginationConfig;
};

function formatCellValue(value: unknown) {
  if (typeof value === "boolean") {
    return value ? "Si" : "No";
  }

  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value);
}

function getRowKey<TData extends Record<string, unknown>>(
  row: TData,
  rowIndex: number,
  rowKey?: keyof TData | ((row: TData, rowIndex: number) => Key),
) {
  if (typeof rowKey === "function") {
    return rowKey(row, rowIndex);
  }

  if (rowKey) {
    return String(row[rowKey]);
  }

  return rowIndex;
}

function normalizeComparable(value: unknown) {
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  return String(value).trim().toLowerCase();
}

function resolveBadgeRule(
  value: unknown,
  rules: DataTableBadgeRule[],
): DataTableBadgeRule | undefined {
  const normalizedValue = normalizeComparable(value);

  return rules.find(
    (badgeRule) => normalizeComparable(badgeRule.value) === normalizedValue,
  );
}

function resolveColumnValue<TData extends Record<string, unknown>>(
  row: TData,
  key: keyof TData | string,
) {
  if (typeof key === "string" && key in row) {
    return row[key as keyof TData];
  }

  return undefined;
}

function renderImageCell<TData extends Record<string, unknown>>(
  row: TData,
  value: unknown,
  imageConfig?: DataTableImageConfig<TData>,
) {
  const src = typeof value === "string" ? value.trim() : "";

  if (!src) {
    return (
      <span className="text-xs text-[var(--muted)]">
        {imageConfig?.fallbackText ?? "Sin imagen"}
      </span>
    );
  }

  const width = imageConfig?.width ?? 44;
  const height = imageConfig?.height ?? 44;
  const alt =
    typeof imageConfig?.alt === "function"
      ? imageConfig.alt(row)
      : (imageConfig?.alt ?? "Imagen");

  return (
    <div
      className={`overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel-muted)] ${
        imageConfig?.className ?? ""
      }`}
      style={{ width, height }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    </div>
  );
}

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
  const totalColumns = headers.length + (rowActions ? 1 : 0);
  const displayedRecords = resolvedRows.length;
  const totalRecords = pagination.totalRecords ?? displayedRecords;

  return (
    <div className="app-card relative overflow-hidden rounded-2xl">
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

          <tbody
            className={`divide-y divide-[var(--line)] transition-opacity ${
              showRefreshingState ? "opacity-70" : "opacity-100"
            }`}
          >
            {showSkeleton ? (
              Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`}>
                  {Array.from({ length: totalColumns }).map((__, cellIndex) => (
                    <td
                      key={`skeleton-${rowIndex}-${cellIndex}`}
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
            ) : resolvedRows.length > 0 ? (
              resolvedRows.map((row, rowIndex) => (
                <tr
                  key={getRowKey(row, rowIndex, rowKey)}
                  className="odd:bg-[var(--panel)] even:bg-[var(--panel-muted)]/70 hover:bg-[var(--panel-muted)]/85"
                >
                  {headers.map((column) => {
                    const rawValue = resolveColumnValue(row, column.key);
                    const badgeConfig = badges.find(
                      (badge) => String(badge.columnKey) === String(column.key),
                    );
                    const badgeRule = badgeConfig
                      ? resolveBadgeRule(rawValue, badgeConfig.rules)
                      : undefined;

                    const cellContent = (() => {
                      if (column.render) {
                        return column.render(row);
                      }

                      if (badgeRule) {
                        return (
                          <DataTableBadge
                            label={badgeRule.label}
                            iconPath={badgeRule.iconPath}
                            textClassName={badgeRule.textClassName}
                            backgroundClassName={badgeRule.backgroundClassName}
                          />
                        );
                      }

                      if (column.dataType === "image") {
                        return renderImageCell(
                          row,
                          rawValue,
                          column.imageConfig,
                        );
                      }

                      if (column.textFormatter) {
                        return column.textFormatter(rawValue, row);
                      }

                      return formatCellValue(rawValue);
                    })();

                    return (
                      <td
                        key={`${rowIndex}-${String(column.key)}`}
                        className={`px-4 py-3 text-sm text-[var(--foreground)] ${
                          column.className ?? ""
                        }`}
                      >
                        {cellContent}
                      </td>
                    );
                  })}

                  {rowActions ? (
                    <td className="px-4 py-3 text-sm text-[var(--foreground)]">
                      <TableRowActions
                        primaryButtonLabel={rowActions.primaryButtonLabel}
                        onPrimaryAction={() => rowActions.onPrimaryAction(row)}
                        dropdownOptions={rowActions.dropdownOptions?.map(
                          (option): DataTableRowActionOption => ({
                            label:
                              typeof option.label === "function"
                                ? option.label(row)
                                : option.label,
                            onClick: () => option.onClick(row),
                          }),
                        )}
                      />
                    </td>
                  ) : null}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={totalColumns}
                  className="px-4 py-8 text-center text-xl text-[var(--muted)]"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-[var(--line)] px-4 py-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-[var(--foreground)]">
          Mostrando {displayedRecords} de {totalRecords} registro
          {totalRecords === 1 ? "" : "s"}
        </p>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            type="button"
            className="app-button-secondary rounded-2xl px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-45"
            onClick={() => pagination.onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            Anterior
          </button>

          <span className="text-sm text-[var(--foreground)]">
            Pagina {pagination.page} de {Math.max(pagination.totalPages, 1)}
          </span>

          <button
            type="button"
            className="app-button-secondary rounded-2xl px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-45"
            onClick={() => pagination.onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
