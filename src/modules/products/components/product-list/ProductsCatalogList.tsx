"use client";

import type { Product } from "@/modules/products/services/product-service";

import { ProductCatalogCard } from "./ProductCatalogCard";
import { ProductsCatalogEmptyState } from "./ProductsCatalogEmptyState";
import { ProductsCatalogPagination } from "./ProductsCatalogPagination";
import { ProductsCatalogSkeleton } from "./ProductsCatalogSkeleton";

type ProductsCatalogListProps = {
  products: Product[];
  currency: string;
  page: number;
  totalPages: number;
  totalRecords: number;
  isLoading: boolean;
  canEditProducts: boolean;
  canDeleteProducts: boolean;
  onPageChange: (page: number) => void;
  onOpenProductDetail: (product: Product) => void;
  onEditClick: (product: Product) => void;
  onToggleStatus: (product: Product) => void;
};

export function ProductsCatalogList({
  products,
  currency,
  page,
  totalPages,
  totalRecords,
  isLoading,
  canEditProducts,
  canDeleteProducts,
  onPageChange,
  onOpenProductDetail,
  onEditClick,
  onToggleStatus,
}: ProductsCatalogListProps) {
  const showSkeleton = isLoading && products.length === 0;
  const showRefreshingState = isLoading && products.length > 0;
  const totalLabel =
    totalRecords > products.length
      ? `Mostrando ${products.length} de ${totalRecords}`
      : "Mostrando todos los productos";

  return (
    <div className="space-y-4">
      {showRefreshingState ? (
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--panel)] px-3 py-1.5 text-xs font-semibold text-[var(--muted)] shadow-none">
          <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
          Actualizando productos...
        </div>
      ) : null}

      {showSkeleton ? (
        <ProductsCatalogSkeleton rows={4} />
      ) : products.length > 0 ? (
        <div className={`space-y-3 ${showRefreshingState ? "opacity-70" : ""}`}>
          {products.map((product) => (
            <ProductCatalogCard
              key={product.id}
              product={product}
              currency={currency}
              canEditProducts={canEditProducts}
              canDeleteProducts={canDeleteProducts}
              onOpenDetail={onOpenProductDetail}
              onEdit={onEditClick}
              onToggleStatus={onToggleStatus}
            />
          ))}
        </div>
      ) : (
        <ProductsCatalogEmptyState />
      )}

      {products.length > 0 ? (
        <div className="border-t border-[var(--line)] pt-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--panel-strong)]">
                <span
                  aria-hidden="true"
                  className="h-5 w-5 bg-[var(--muted)] opacity-75"
                  style={{
                    WebkitMaskImage: "url(/icons/box.svg)",
                    maskImage: "url(/icons/box.svg)",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    WebkitMaskPosition: "center",
                    maskPosition: "center",
                    WebkitMaskSize: "contain",
                    maskSize: "contain",
                  }}
                />
              </div>

              <div>
                <p className="text-[13px] font-semibold text-[var(--foreground-strong)]">
                  {products.length} producto{products.length === 1 ? "" : "s"}
                </p>
                <p className="text-[12px] text-[var(--muted)]">{totalLabel}</p>
              </div>
            </div>

            <ProductsCatalogPagination
              page={page}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
