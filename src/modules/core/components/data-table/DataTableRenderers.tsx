"use client";

import { DataTableBadge } from "@/modules/core/components/DataTableBadge";

import type { DataTableBadgeConfig, DataTableColumn } from "./DataTableTypes";
import {
  collectImageSources,
  formatCellValue,
  normalizeKeyComparison,
  resolveBadgeRule,
  resolveColumnValue,
  summarizeValue,
} from "./DataTableHelpers";
import {
  renderCompactImagePreview,
  renderEmptyImagePlaceholder,
  renderImageCell,
} from "./DataTableImage";

export function renderDesktopColumnContent<TData extends Record<string, unknown>>(
  row: TData,
  column: DataTableColumn<TData>,
  badges: Array<DataTableBadgeConfig<TData>>,
) {
  const rawValue = resolveColumnValue(row, column.key);
  const badgeConfig = badges.find(
    (badge) =>
      normalizeKeyComparison(badge.columnKey) ===
      normalizeKeyComparison(column.key),
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

export function renderMobileSummaryValue<TData extends Record<string, unknown>>(
  row: TData,
  column: DataTableColumn<TData>,
  badges: Array<DataTableBadgeConfig<TData>> = [],
) {
  const rawValue = resolveColumnValue(row, column.key);
  const badgeConfig = badges.find(
    (badge) =>
      normalizeKeyComparison(badge.columnKey) ===
      normalizeKeyComparison(column.key),
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

  if (column.dataType === "image") {
    const imageSources =
      typeof rawValue === "string" && rawValue.trim()
        ? collectImageSources(rawValue)
        : collectImageSources(rawValue);

    if (imageSources.length > 0) {
      return renderCompactImagePreview(imageSources, column.header);
    }

    return renderEmptyImagePlaceholder(44);
  }

  const imageSources = collectImageSources(rawValue);
  if (imageSources.length > 0) {
    return renderCompactImagePreview(imageSources, column.header);
  }

  return summarizeValue(rawValue);
}
