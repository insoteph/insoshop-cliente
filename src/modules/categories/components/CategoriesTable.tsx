"use client";

import { useMemo } from "react";

import {
  DataTable,
  type DataTableBadgeConfig,
  type DataTableColumn,
} from "@/modules/core/components/DataTable";
import type { Category } from "@/modules/categories/services/category-service";

type CategoriesTableProps = {
  categories: Category[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  totalRecords: number;
  canManage: boolean;
  onPageChange: (page: number) => void;
  onDetails: (category: Category) => void;
  onEdit: (category: Category) => void;
  onToggleStatus: (category: Category) => void;
};

export function CategoriesTable({
  categories,
  isLoading,
  page,
  totalPages,
  totalRecords,
  canManage,
  onPageChange,
  onDetails,
  onEdit,
  onToggleStatus,
}: CategoriesTableProps) {
  const columns = useMemo<DataTableColumn<Category>[]>(
    () => [
      {
        key: "nombre",
        header: "Categoria",
        className: "font-semibold",
      },
      {
        key: "estado",
        header: "Estado",
      },
    ],
    [],
  );

  const stateBadges = useMemo<Array<DataTableBadgeConfig<Category>>>(
    () => [
      {
        columnKey: "estado",
        rules: [
          {
            value: true,
            label: "Activa",
            iconPath: "/icons/check.svg",
            textClassName: "app-badge-success",
            backgroundClassName: "",
          },
          {
            value: false,
            label: "Inactiva",
            iconPath: "/icons/cross.svg",
            textClassName: "app-badge-neutral",
            backgroundClassName: "",
          },
        ],
      },
    ],
    [],
  );

  const rowActions = {
    primaryButtonLabel: "Detalles",
    onPrimaryAction: onDetails,
    dropdownOptions: canManage
      ? [
          {
            label: "Editar",
            onClick: onEdit,
          },
          {
            label: (category: Category) =>
              category.estado ? "Inactivar" : "Activar",
            onClick: onToggleStatus,
          },
        ]
      : [],
  };

  return (
    <DataTable
      headers={columns}
      data={categories}
      isLoading={isLoading}
      rowKey="id"
      emptyMessage="No hay categorias registradas para esta tienda."
      badges={stateBadges}
      rowActions={rowActions}
      pagination={{
        page,
        totalPages,
        totalRecords,
        onPageChange,
      }}
    />
  );
}
