"use client";

import { TableRowActions } from "@/modules/core/components/TableRowActions";
import type { Product } from "@/modules/products/services/product-service";

type ProductCatalogCardActionsProps = {
  product: Product;
  canEditProducts: boolean;
  canDeleteProducts: boolean;
  onOpenDetail: (product: Product) => void;
  onEdit: (product: Product) => void;
  onToggleStatus: (product: Product) => void;
};

export function ProductCatalogCardActions({
  product,
  canEditProducts,
  canDeleteProducts,
  onOpenDetail,
  onEdit,
  onToggleStatus,
}: ProductCatalogCardActionsProps) {
  const hasExtraActions = canEditProducts || canDeleteProducts;

  return (
    <div className="flex justify-end">
      <TableRowActions
        primaryButtonLabel="Ver"
        primaryButtonIconPath="/icons/eye.svg"
        onPrimaryAction={() => onOpenDetail(product)}
        dropdownOptions={
          hasExtraActions
            ? [
                ...(canEditProducts
                  ? [
                      {
                        label: "Editar",
                        onClick: () => onEdit(product),
                      },
                    ]
                  : []),
                ...(canDeleteProducts
                  ? [
                      {
                        label: product.estado ? "Inactivar" : "Activar",
                        onClick: () => onToggleStatus(product),
                      },
                    ]
                  : []),
              ]
            : []
        }
      />
    </div>
  );
}
