"use client";

import { ProductDetailModal } from "@/modules/products/components/ProductDetailModal";
import { ProductFormPanel } from "@/modules/products/components/ProductFormPanel";
import { ProductsTable } from "@/modules/products/components/ProductsTable";
import { ProductsToolbar } from "@/modules/products/components/ProductsToolbar";
import { useProductsPanel } from "@/modules/products/hooks/useProductsPanel";
import type { ProductFormState } from "@/modules/products/types/product-form.types";

type ProductsPanelProps = {
  storeId: number;
  canCreateProducts: boolean;
  canEditProducts: boolean;
  canDeleteProducts: boolean;
  canEditAttributes: boolean;
  canDeleteAttributes: boolean;
  currency: string;
};

export function ProductsPanel({
  storeId,
  canCreateProducts,
  canEditProducts,
  canDeleteProducts,
  canEditAttributes,
  canDeleteAttributes,
  currency,
}: ProductsPanelProps) {
  const {
    products,
    categories,
    page,
    totalPages,
    totalRecords,
    search,
    statusFilter,
    isLoading,
    isSaving,
    error,
    formError,
    isFormMounted,
    isFormVisible,
    editingProductId,
    form,
    isProductDetailOpen,
    selectedProduct,
    productDetail,
    isProductDetailLoading,
    productDetailError,
    setForm,
    handleCreateClick,
    handleOpenProductDetail,
    handleCloseProductDetail,
    handleRetryProductDetail,
    handleEditClick,
    handleSaveProduct,
    handleToggleStatus,
    handleSearchChange,
    handleStatusFilterChange,
    handlePageChange,
    closeFormPanel,
  } = useProductsPanel({ storeId });

  return (
    <section className="space-y-5">
      <ProductsToolbar
        search={search}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        error={error}
        canCreateProducts={canCreateProducts}
        onCreateClick={handleCreateClick}
      />

      {isFormMounted ? (
        <ProductFormPanel
          storeId={storeId}
          isVisible={isFormVisible}
          editingProductId={editingProductId}
          isSaving={isSaving}
          formError={formError}
          form={form}
          categories={categories}
          canCreateProducts={canCreateProducts}
          canEditProducts={canEditProducts}
          canDeleteProducts={canDeleteProducts}
          canEditAttributes={canEditAttributes}
          canDeleteAttributes={canDeleteAttributes}
          onClose={() => closeFormPanel(true)}
          onSubmit={handleSaveProduct}
          onNombreChange={(value) =>
            setForm((current: ProductFormState) => ({
              ...current,
              nombre: value,
            }))
          }
          onCategoriaChange={(value) =>
            setForm((current: ProductFormState) => ({
              ...current,
              categoriaId: value,
            }))
          }
          onDescripcionChange={(value) =>
            setForm((current: ProductFormState) => ({
              ...current,
              descripcion: value,
            }))
          }
          onAtributosChange={(atributos) =>
            setForm((current: ProductFormState) => ({
              ...current,
              atributos,
            }))
          }
          onVariantesChange={(variantes) =>
            setForm((current: ProductFormState) => ({
              ...current,
              variantes,
            }))
          }
        />
      ) : null}

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

      <ProductsTable
        products={products}
        currency={currency}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        totalRecords={totalRecords}
        canEditProducts={canEditProducts}
        canDeleteProducts={canDeleteProducts}
        onPageChange={handlePageChange}
        onOpenProductDetail={handleOpenProductDetail}
        onEditClick={handleEditClick}
        onToggleStatus={handleToggleStatus}
      />
    </section>
  );
}
