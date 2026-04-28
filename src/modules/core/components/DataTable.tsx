"use client";

import {
  Fragment,
  type Key,
  type ReactNode,
  useEffect,
  useState,
} from "react";

import {
  DataTableBadge,
  type DataTableBadgeRule,
} from "@/modules/core/components/DataTableBadge";
import {
  TableRowActions,
  type DataTableRowActionOption,
} from "@/modules/core/components/TableRowActions";
import { DataTableMobileDetailModal } from "@/modules/core/components/DataTableMobileDetailModal";

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
  primaryButtonLabel: string | ((row: TData) => string);
  onPrimaryAction: (row: TData) => void;
  dropdownOptions?: Array<{
    label: string | ((row: TData) => string);
    onClick: (row: TData) => void;
    hidden?: boolean | ((row: TData) => boolean);
  }>;
};

export type DataTableExpandedRowConfig<TData extends Record<string, unknown>> = {
  isExpanded: (row: TData) => boolean;
  render: (row: TData) => ReactNode;
  className?: string;
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
  expandedRow?: DataTableExpandedRowConfig<TData>;
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

function ImagePlaceholder({
  size = 48,
  className = "",
  iconPath = "/icons/no-image.svg",
}: {
  size?: number;
  className?: string;
  iconPath?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`inline-flex items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--panel-muted)] ${className}`}
      style={{ width: size, height: size }}
    >
      <span
        className="inline-block h-5 w-5 bg-[var(--muted)]"
        style={{
          WebkitMaskImage: `url(${iconPath})`,
          maskImage: `url(${iconPath})`,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          WebkitMaskSize: "contain",
          maskSize: "contain",
        }}
      />
    </div>
  );
}

function isLikelyImageUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return false;
  }

  return /(\.png|\.jpe?g|\.webp|\.gif|\.avif|\.svg)(\?|#|$)/i.test(trimmed);
}

function collectImageSources(value: unknown, depth = 0): string[] {
  if (depth > 3 || value === null || value === undefined) {
    return [];
  }

  if (typeof value === "string") {
    return isLikelyImageUrl(value) ? [value.trim()] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectImageSources(item, depth + 1));
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const imageKeys = [
      "urlImagenPrincipal",
      "urlImagen",
      "url",
      "src",
      "image",
      "imagen",
      "path",
    ];

    const directImage = imageKeys.find((key) => {
      const candidate = record[key];
      return typeof candidate === "string" && isLikelyImageUrl(candidate);
    });

    if (directImage) {
      return [String(record[directImage]).trim()];
    }

    if ("items" in record && Array.isArray(record.items)) {
      return collectImageSources(record.items, depth + 1);
    }

    return Object.values(record).flatMap((entry) =>
      collectImageSources(entry, depth + 1),
    );
  }

  return [];
}

function summarizeValue(value: unknown, depth = 0): string {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (typeof value === "boolean") {
    return value ? "Si" : "No";
  }

  if (typeof value === "number" || typeof value === "bigint") {
    return String(value);
  }

  if (typeof value === "string") {
    return value.trim() || "-";
  }

  if (depth > 2) {
    return "-";
  }

  if (Array.isArray(value)) {
    const imageSources = collectImageSources(value, depth + 1);
    if (imageSources.length > 0) {
      return `${imageSources.length} imagen${imageSources.length === 1 ? "" : "es"}`;
    }

    const items = value
      .map((item) => summarizeValue(item, depth + 1))
      .filter((item) => item !== "-");

    return items.length > 0 ? items.join(", ") : "-";
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const imageSources = collectImageSources(record, depth + 1);
    if (imageSources.length > 0) {
      return `${imageSources.length} imagen${imageSources.length === 1 ? "" : "es"}`;
    }

    const preferredKeys = [
      "nombre",
      "name",
      "titulo",
      "title",
      "valor",
      "label",
      "slug",
      "codigo",
      "email",
    ];

    for (const key of preferredKeys) {
      const candidate = record[key];
      if (typeof candidate === "string" && candidate.trim()) {
        return candidate.trim();
      }
    }

    if ("items" in record && Array.isArray(record.items)) {
      return summarizeValue(record.items, depth + 1);
    }

    const meaningfulEntries = Object.entries(record)
      .slice(0, 3)
      .map(([key, candidate]) => `${key}: ${summarizeValue(candidate, depth + 1)}`)
      .filter((entry) => !entry.endsWith(": -"));

    return meaningfulEntries.length > 0 ? meaningfulEntries.join(" • ") : "-";
  }

  return String(value);
}

function renderImagePreviewStack(srcs: string[], title: string) {
  if (srcs.length === 1) {
    return (
      <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={srcs[0]} alt={title} className="h-48 w-full object-cover" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={srcs[0]} alt={title} className="h-48 w-full object-cover" />

        <div className="absolute bottom-3 left-3 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-white">
          {srcs.length} imágenes
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {srcs.slice(1, 4).map((src, index) => (
          <div
            key={`${src}-${index}`}
            className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`${title} ${index + 2}`}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function renderCompactImagePreview(srcs: string[], title: string) {
  const [firstImage] = srcs;

  if (!firstImage) {
    return <ImagePlaceholder />;
  }

  return (
    <div className="relative inline-flex overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={firstImage} alt={title} className="h-12 w-12 object-cover" />
      {srcs.length > 1 ? (
        <span className="absolute bottom-1 right-1 rounded-full bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
          +{srcs.length - 1}
        </span>
      ) : null}
    </div>
  );
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
  const width = imageConfig?.width ?? 44;
  const height = imageConfig?.height ?? 44;
  const alt =
    typeof imageConfig?.alt === "function"
      ? imageConfig.alt(row)
      : (imageConfig?.alt ?? "Imagen");

  if (!src) {
    return (
      <ImagePlaceholder
        size={Math.max(width, height)}
        iconPath="/icons/no-image.svg"
      />
    );
  }

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
  expandedRow,
  pagination,
}: DataTableProps<TData>) {
  const resolvedRows = rows ?? data ?? [];
  const showSkeleton = isLoading && resolvedRows.length === 0;
  const showRefreshingState = isLoading && resolvedRows.length > 0;
  const totalColumns = headers.length + (rowActions ? 1 : 0);
  const displayedRecords = resolvedRows.length;
  const totalRecords = pagination.totalRecords ?? displayedRecords;
  const [mobileDetailRow, setMobileDetailRow] = useState<TData | null>(null);

  useEffect(() => {
    if (!mobileDetailRow) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileDetailRow]);

  function renderColumnContent(row: TData, column: DataTableColumn<TData>) {
    const rawValue = resolveColumnValue(row, column.key);
    const badgeConfig = badges.find(
      (badge) => String(badge.columnKey) === String(column.key),
    );
    const badgeRule = badgeConfig
      ? resolveBadgeRule(rawValue, badgeConfig.rules)
      : undefined;

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
      return renderImageCell(row, rawValue, column.imageConfig);
    }

    if (column.textFormatter) {
      return column.textFormatter(rawValue, row);
    }

    return formatCellValue(rawValue);
  }

  function renderMobileSummaryValue(
    row: TData,
    column: DataTableColumn<TData>,
  ) {
    if (column.dataType === "image") {
      const rawValue = resolveColumnValue(row, column.key);
      const imageSources =
        typeof rawValue === "string" && isLikelyImageUrl(rawValue)
          ? [rawValue.trim()]
          : collectImageSources(rawValue);

      if (imageSources.length > 0) {
        return renderCompactImagePreview(imageSources, column.header);
      }

      return <ImagePlaceholder size={44} />;
    }

    const rawValue = resolveColumnValue(row, column.key);
    const imageSources = collectImageSources(rawValue);
    if (imageSources.length > 0) {
      return renderCompactImagePreview(imageSources, column.header);
    }

    return summarizeValue(rawValue);
  }

  function renderDetailValue(row: TData, column: DataTableColumn<TData>) {
    const rawValue = resolveColumnValue(row, column.key);

    if (column.dataType === "image") {
      if (typeof rawValue === "string" && isLikelyImageUrl(rawValue)) {
        return renderImagePreviewStack([rawValue.trim()], column.header);
      }

      const imageSources = collectImageSources(rawValue);
      if (imageSources.length > 0) {
        return renderImagePreviewStack(imageSources, column.header);
      }

      return <ImagePlaceholder size={192} className="w-full rounded-2xl" iconPath="/icons/no-image.svg" />;
    }

    const imageSources = collectImageSources(rawValue);
    if (imageSources.length > 0) {
      return renderImagePreviewStack(imageSources, column.header);
    }

    if (column.render) {
      return column.render(row);
    }

    if (column.textFormatter) {
      return column.textFormatter(rawValue, row);
    }

    const badgeConfig = badges.find(
      (badge) => String(badge.columnKey) === String(column.key),
    );
    const badgeRule = badgeConfig
      ? resolveBadgeRule(rawValue, badgeConfig.rules)
      : undefined;

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

    return <span>{summarizeValue(rawValue)}</span>;
  }

  const mobileSummaryColumns = headers.slice(0, Math.min(2, headers.length));

  return (
    <div className="app-card relative overflow-hidden rounded-2xl">
      {showRefreshingState ? (
        <div className="data-table-refresh-indicator" aria-live="polite">
          Actualizando resultados...
        </div>
      ) : null}

      <div className="space-y-3 px-4 py-4 md:hidden">
        {showSkeleton ? (
          Array.from({ length: skeletonRows }).map((_, rowIndex) => (
            <article
              key={`mobile-skeleton-${rowIndex}`}
              className="rounded-[22px] border border-[var(--line)] bg-[var(--panel)] p-4 shadow-sm"
            >
              <div className="space-y-3">
                {Array.from({ length: Math.max(mobileSummaryColumns.length, 2) }).map(
                  (_, lineIndex) => (
                    <div key={`mobile-skeleton-${rowIndex}-${lineIndex}`} className="space-y-2">
                      <span className="block h-3 w-24 animate-pulse rounded bg-[var(--panel-muted)]" />
                      <span className="block h-4 w-full animate-pulse rounded bg-[var(--panel-muted)]" />
                    </div>
                  ),
                )}
              </div>
            </article>
          ))
        ) : resolvedRows.length > 0 ? (
          resolvedRows.map((row, rowIndex) => {
            const computedRowKey = getRowKey(row, rowIndex, rowKey);
            const mobileRowKey = String(computedRowKey);
            const visibleDropdownOptions = rowActions?.dropdownOptions
              ?.filter((option) => {
                if (typeof option.hidden === "function") {
                  return !option.hidden(row);
                }

                return !option.hidden;
              })
              .map((option): DataTableRowActionOption => ({
                label:
                  typeof option.label === "function" ? option.label(row) : option.label,
                onClick: () => option.onClick(row),
              }));

            return (
              <article
                key={`mobile-${mobileRowKey}`}
                className="overflow-hidden rounded-[22px] border border-[var(--line)] bg-[var(--panel)] shadow-sm"
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setMobileDetailRow(row)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setMobileDetailRow(row);
                    }
                  }}
                  className="block w-full cursor-pointer text-left"
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
                      Toca la tarjeta para ver todos los datos
                    </p>
                    {rowActions ? (
                      <TableRowActions
                        primaryButtonLabel={
                          typeof rowActions.primaryButtonLabel === "function"
                            ? rowActions.primaryButtonLabel(row)
                            : rowActions.primaryButtonLabel
                        }
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
          <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--panel)] px-4 py-8 text-center text-sm text-[var(--muted)]">
            {emptyMessage}
          </div>
        )}
      </div>

      <div className="hidden overflow-x-auto md:block">
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
              resolvedRows.map((row, rowIndex) => {
                const computedRowKey = getRowKey(row, rowIndex, rowKey);
                const visibleDropdownOptions = rowActions?.dropdownOptions
                  ?.filter((option) => {
                    if (typeof option.hidden === "function") {
                      return !option.hidden(row);
                    }

                    return !option.hidden;
                  })
                  .map(
                    (option): DataTableRowActionOption => ({
                      label:
                        typeof option.label === "function"
                          ? option.label(row)
                          : option.label,
                      onClick: () => option.onClick(row),
                    }),
                  );

                return (
                  <Fragment key={computedRowKey}>
                    <tr className="odd:bg-[var(--panel)] even:bg-[var(--panel-muted)]/70 hover:bg-[var(--panel-muted)]/85">
                      {headers.map((column) => {
                        return (
                          <td
                            key={`${rowIndex}-${String(column.key)}`}
                            className={`px-4 py-3 text-sm text-[var(--foreground)] ${
                              column.className ?? ""
                            }`}
                          >
                            {renderColumnContent(row, column)}
                          </td>
                        );
                      })}

                      {rowActions ? (
                        <td className="px-4 py-3 text-sm text-[var(--foreground)]">
                          <TableRowActions
                            primaryButtonLabel={
                              typeof rowActions.primaryButtonLabel ===
                              "function"
                                ? rowActions.primaryButtonLabel(row)
                                : rowActions.primaryButtonLabel
                            }
                            onPrimaryAction={() =>
                              rowActions.onPrimaryAction(row)
                            }
                            dropdownOptions={visibleDropdownOptions}
                          />
                        </td>
                      ) : null}
                    </tr>

                    {expandedRow?.isExpanded(row) ? (
                      <tr className="bg-[var(--panel)]">
                        <td
                          colSpan={totalColumns}
                          className={`px-4 py-4 text-sm text-[var(--foreground)] ${
                            expandedRow.className ?? ""
                          }`}
                        >
                          {expandedRow.render(row)}
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })
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

      <DataTableMobileDetailModal
        open={mobileDetailRow !== null}
        title={headers[0] ? String(headers[0].header) : "Información"}
        items={
          mobileDetailRow
            ? headers.map((column) => ({
                label: column.header,
                value: renderDetailValue(mobileDetailRow, column),
              }))
            : []
        }
        onClose={() => setMobileDetailRow(null)}
        primaryActionLabel={
          rowActions && mobileDetailRow
            ? typeof rowActions.primaryButtonLabel === "function"
              ? rowActions.primaryButtonLabel(mobileDetailRow)
              : rowActions.primaryButtonLabel
            : undefined
        }
        onPrimaryAction={
          rowActions && mobileDetailRow
            ? () => {
                const currentRow = mobileDetailRow;
                setMobileDetailRow(null);
                rowActions.onPrimaryAction(currentRow);
              }
            : undefined
        }
      />

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
