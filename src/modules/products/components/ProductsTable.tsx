"use client";

import { useMemo } from "react";

import {
  DataTable,
  type DataTableBadgeConfig,
  type DataTableColumn,
} from "@/modules/core/components/DataTable";
import { formatCurrency } from "@/modules/core/lib/formatters";
import { NoImageThumbnail } from "@/modules/products/components/shared/ProductVisuals";
import type { Product } from "@/modules/products/services/product-service";

type ProductsTableProps = {
  products: Product[];
  currency: string;
  isLoading: boolean;
  page: number;
  totalPages: number;
  totalRecords: number;
  canEditProducts: boolean;
  canDeleteProducts: boolean;
  onPageChange: (page: number) => void;
  onOpenProductDetail: (product: Product) => void;
  onEditClick: (product: Product) => void;
  onToggleStatus: (product: Product) => void;
};

export function ProductsTable({
  products,
  currency,
  isLoading,
  page,
  totalPages,
  totalRecords,
  canEditProducts,
  canDeleteProducts,
  onPageChange,
  onOpenProductDetail,
  onEditClick,
  onToggleStatus,
}: ProductsTableProps) {
  const columns = useMemo<DataTableColumn<Product>[]>(
    () => [
      {
        key: "imagenes",
        header: "Imagen",
        render: (product) => {
          const imageUrl = product.imagenes[0]?.url?.trim();

          if (!imageUrl) {
            return <NoImageThumbnail />;
          }

          return (
            <div className="h-14 w-14 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={product.nombre}
                className="h-full w-full object-cover"
              />
            </div>
          );
        },
      },
      {
        key: "nombre",
        header: "Producto",
        className: "font-semibold",
      },
      {
        key: "categoriaNombre",
        header: "Categoria",
      },
      {
        key: "precio",
        header: "Precio desde",
        textFormatter: (value: unknown) =>
          formatCurrency(Number(value ?? 0), currency),
      },
      {
        key: "cantidad",
        header: "Stock total",
      },
      {
        key: "estado",
        header: "Estado",
      },
    ],
    [currency],
  );

  const stateBadges = useMemo<Array<DataTableBadgeConfig<Product>>>(
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

  const rowActions =
    canEditProducts || canDeleteProducts
      ? {
          primaryButtonLabel: "Detalles",
          onPrimaryAction: onOpenProductDetail,
          dropdownOptions: [
            ...(canEditProducts
              ? [
                  {
                    label: "Editar",
                    onClick: onEditClick,
                  },
                ]
              : []),
            ...(canDeleteProducts
              ? [
                  {
                    label: (product: Product) =>
                      product.estado ? "Inactivar" : "Activar",
                    onClick: onToggleStatus,
                  },
                ]
              : []),
          ],
        }
      : {
          primaryButtonLabel: "Detalles",
          onPrimaryAction: onOpenProductDetail,
        };

  return (
    <DataTable
      headers={columns}
      rows={products}
      rowKey="id"
      isLoading={isLoading}
      emptyMessage="Todavía no hay productos registrados para esta tienda."
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
