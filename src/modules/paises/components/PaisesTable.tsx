"use client";

import { useMemo } from "react";

import {
  DataTable,
  type DataTableBadgeConfig,
  type DataTableColumn,
} from "@/modules/core/components/DataTable";
import type { Pais } from "@/modules/paises/types/paises-types";

type PaisesTableProps = {
  rows: Pais[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
  onEdit: (pais: Pais) => void;
  onToggleStatus: (pais: Pais) => void;
};

export function PaisesTable({
  rows,
  isLoading,
  page,
  totalPages,
  totalRecords,
  onPageChange,
  onEdit,
  onToggleStatus,
}: PaisesTableProps) {
  const columns = useMemo<DataTableColumn<Pais>[]>(
    () => [
      {
        key: "nombrePais",
        header: "Pais",
        className: "font-semibold",
      },
      {
        key: "codigoPais",
        header: "Codigo",
      },
      {
        key: "codigoTelefono",
        header: "Telefono",
      },
      {
        key: "monedaCodigo",
        header: "Moneda",
      },
      {
        key: "estado",
        header: "Estado",
      },
    ],
    [],
  );

  const badges = useMemo<Array<DataTableBadgeConfig<Pais>>>(
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
        label: (pais: Pais) => (pais.estado ? "Inactivar" : "Activar"),
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
      emptyMessage="Todavia no hay paises registrados."
      badges={badges}
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
