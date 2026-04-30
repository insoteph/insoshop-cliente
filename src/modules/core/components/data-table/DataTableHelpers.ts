"use client";

import type { DataTableRowActionOption } from "@/modules/core/components/TableRowActions";
import type { DataTableBadgeRule } from "@/modules/core/components/DataTableBadge";

import type { DataTableRowActionsConfig } from "./DataTableTypes";

export function formatCellValue(value: unknown) {
  if (typeof value === "boolean") {
    return value ? "Si" : "No";
  }

  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value);
}

export function getStableKeyPart(
  key: string | number | symbol,
  fallbackIndex?: number,
) {
  if (typeof key === "symbol") {
    return key.description ?? `symbol-${fallbackIndex ?? 0}`;
  }

  return String(key);
}

export function normalizeReactKey(
  value: unknown,
  fallbackIndex?: number,
): string | number {
  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  if (typeof value === "symbol") {
    return value.description ?? `symbol-${fallbackIndex ?? 0}`;
  }

  if (value === null || value === undefined || value === "") {
    return fallbackIndex ?? 0;
  }

  return String(value);
}

export function normalizeKeyComparison(key: string | number | symbol) {
  return String(normalizeReactKey(key));
}

export function isLikelyImageUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return false;
  }

  return /(\.png|\.jpe?g|\.webp|\.gif|\.avif|\.svg)(\?|#|$)/i.test(trimmed);
}

export function collectImageSources(value: unknown, depth = 0): string[] {
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

export function summarizeValue(value: unknown, depth = 0): string {
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
      .map(
        ([key, candidate]) => `${key}: ${summarizeValue(candidate, depth + 1)}`,
      )
      .filter((entry) => !entry.endsWith(": -"));

    return meaningfulEntries.length > 0 ? meaningfulEntries.join(" • ") : "-";
  }

  return String(value);
}

export function getRowKey<TData extends Record<string, unknown>>(
  row: TData,
  rowIndex: number,
  rowKey?: keyof TData | ((row: TData, rowIndex: number) => string | number),
) {
  if (typeof rowKey === "function") {
    return normalizeReactKey(rowKey(row, rowIndex), rowIndex);
  }

  if (rowKey) {
    if (typeof rowKey === "symbol") {
      return normalizeReactKey(row[rowKey], rowIndex);
    }

    return normalizeReactKey(row[rowKey], rowIndex);
  }

  return rowIndex;
}

export function normalizeComparable(value: unknown) {
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  return String(value).trim().toLowerCase();
}

export function resolveBadgeRule(
  value: unknown,
  rules: DataTableBadgeRule[],
) {
  const normalizedValue = normalizeComparable(value);

  return rules.find(
    (badgeRule) => normalizeComparable(badgeRule.value) === normalizedValue,
  );
}

export function resolveColumnValue<TData extends Record<string, unknown>>(
  row: TData,
  key: keyof TData | string,
) {
  if (typeof key === "string" && key in row) {
    return row[key as keyof TData];
  }

  return undefined;
}

export function getVisibleDropdownOptions<TData extends Record<string, unknown>>(
  row: TData,
  rowActions?: DataTableRowActionsConfig<TData>,
): DataTableRowActionOption[] {
  return (
    rowActions?.dropdownOptions
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
      ) ?? []
  );
}

export function resolvePrimaryButtonLabel<TData extends Record<string, unknown>>(
  row: TData,
  rowActions?: DataTableRowActionsConfig<TData>,
) {
  if (!rowActions) {
    return "";
  }

  return typeof rowActions.primaryButtonLabel === "function"
    ? rowActions.primaryButtonLabel(row)
    : rowActions.primaryButtonLabel;
}

export function getTotalColumns(
  headersLength: number,
  rowActionsEnabled: boolean,
) {
  return headersLength + (rowActionsEnabled ? 1 : 0);
}
