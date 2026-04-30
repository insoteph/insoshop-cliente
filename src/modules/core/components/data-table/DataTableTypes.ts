"use client";

import type { ReactNode } from "react";

import type { DataTableBadgeRule } from "@/modules/core/components/DataTableBadge";

export type DataTableCellType = "text" | "image";

export type DataTableImageConfig<TData extends Record<string, unknown>> = {
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

export type DataTablePaginationConfig = {
  page: number;
  totalPages: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
};

export type DataTableProps<TData extends Record<string, unknown>> = {
  headers: Array<DataTableColumn<TData>>;
  rows?: TData[];
  data?: TData[];
  isLoading?: boolean;
  skeletonRows?: number;
  rowKey?: keyof TData | ((row: TData, rowIndex: number) => string | number);
  emptyMessage?: string;
  badges?: Array<DataTableBadgeConfig<TData>>;
  rowActions?: DataTableRowActionsConfig<TData>;
  pagination: DataTablePaginationConfig;
};
