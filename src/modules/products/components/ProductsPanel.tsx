"use client";

import { useRouter } from "next/navigation";

import { ProductDetailModal } from "@/modules/products/components/ProductDetailModal";
import { ProductsToolbar } from "@/modules/products/components/ProductsToolbar";
import { ProductsCatalogList } from "@/modules/products/components/product-list/ProductsCatalogList";
import { useProductsPanel } from "@/modules/products/hooks/useProductsPanel";
import {
  buildProductCreatePath,
  buildProductEditPath,
} from "@/modules/products/lib/product-routing";

type ProductsPanelProps = {
  storeId: number;
  canCreateProducts: boolean;
  canEditProducts: boolean;
  canDeleteProducts: boolean;
  currency: string;
};

export function ProductsPanel({
  storeId,
  canCreateProducts,
  canEditProducts,
  canDeleteProducts,
  currency,
}: ProductsPanelProps) {
  const router = useRouter();
  const {
    products,
    page,
    totalPages,
    totalRecords,
    search,
    isLoading,
    error,
    isProductDetailOpen,
    selectedProduct,
    productDetail,
    isProductDetailLoading,
    productDetailError,
    handleOpenProductDetail,
    handleCloseProductDetail,
    handleRetryProductDetail,
    handleToggleStatus,
    handleSearchChange,
    handlePageChange,
  } = useProductsPanel({ storeId });

  return (
    <section className="space-y-5">
      <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)] shadow-[var(--shadow)]">
        <div className="space-y-4 px-4 py-4 md:px-5 md:py-5">
          <ProductsToolbar
            search={search}
            onSearchChange={handleSearchChange}
            error={error}
            canCreateProducts={canCreateProducts}
            onCreateClick={() => router.push(buildProductCreatePath())}
          />
        </div>

        <div className="px-4 py-4 md:px-5">
          <ProductsCatalogList
            products={products}
            currency={currency}
            page={page}
            totalPages={totalPages}
            totalRecords={totalRecords}
            isLoading={isLoading}
            canEditProducts={canEditProducts}
            canDeleteProducts={canDeleteProducts}
            onPageChange={handlePageChange}
            onOpenProductDetail={handleOpenProductDetail}
            onEditClick={(product) => router.push(buildProductEditPath(product.id))}
            onToggleStatus={handleToggleStatus}
          />
        </div>
      </div>

      <ProductDetailModal
        open={isProductDetailOpen}
        product={selectedProduct}
        detail={productDetail}
        isLoading={isProductDetailLoading}
        error={productDetailError}
        currency={currency}
        onClose={handleCloseProductDetail}
        onRetry={handleRetryProductDetail}
      />
    </section>
  );
}
