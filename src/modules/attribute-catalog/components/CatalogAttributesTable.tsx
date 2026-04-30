"use client";

import { useMemo } from "react";

import {
  DataTable,
  type DataTableBadgeConfig,
  type DataTableColumn,
} from "@/modules/core/components/DataTable";
import type { CatalogAttribute } from "@/modules/attribute-catalog/services/attribute-catalog-service";

type CatalogAttributesTableProps = {
  rows: CatalogAttribute[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
  onEdit: (attribute: CatalogAttribute) => void;
  onToggleStatus: (attribute: CatalogAttribute) => void;
};

export function CatalogAttributesTable({
  rows,
  isLoading,
  page,
  totalPages,
  totalRecords,
  onPageChange,
  onEdit,
  onToggleStatus,
}: CatalogAttributesTableProps) {
  const columns = useMemo<DataTableColumn<CatalogAttribute>[]>(
    () => [
      {
        key: "nombre",
        header: "Atributo",
        className: "font-semibold",
      },
      {
        key: "cantidadValores",
        header: "Valores",
      },
      {
        key: "estado",
        header: "Estado",
      },
    ],
    [],
  );

  const stateBadges = useMemo<Array<DataTableBadgeConfig<CatalogAttribute>>>(
    () => [
      {
        columnKey: "estado",
        rules: [
          {
            value: true,
            label: "Activo",
            iconPath: "/icons/check.svg",
            textClassName: "app-badge-success",
            backgroundClassName: "",
          },
          {
            value: false,
            label: "Inactivo",
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
    primaryButtonLabel: "Editar",
    onPrimaryAction: onEdit,
    dropdownOptions: [
      {
        label: (attribute: CatalogAttribute) =>
          attribute.estado ? "Inactivar" : "Activar",
        onClick: onToggleStatus,
      },
    ],
  };

  return (
    <DataTable
      headers={columns}
      rows={rows}
      rowKey="id"
      isLoading={isLoading}
      emptyMessage="Todavía no hay atributos de catálogo registrados."
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

