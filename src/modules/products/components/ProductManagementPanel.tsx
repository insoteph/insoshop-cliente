"use client";

import { ProductManagementAttributesSection } from "@/modules/products/components/ProductManagementAttributesSection";
import { ProductManagementHeader } from "@/modules/products/components/ProductManagementHeader";
import { ProductManagementVariantsSection } from "@/modules/products/components/ProductManagementVariantsSection";
import { useProductManagementPanel } from "@/modules/products/hooks/useProductManagementPanel";

type ProductManagementPanelProps = {
  productId: number;
  storeId: number;
  currency: string;
  canManage: boolean;
  onProductMutated: () => Promise<void> | void;
};

export function ProductManagementPanel({
  productId,
  storeId,
  currency,
  canManage,
  onProductMutated,
}: ProductManagementPanelProps) {
  const {
    product,
    isLoading,
    error,
    attributeFormError,
    variantFormError,
    editingAttributeId,
    editingVariantId,
    attributeForm,
    variantForm,
    setAttributeForm,
    setVariantForm,
    isAttributeEditorOpen,
    isVariantEditorOpen,
    isSavingAttribute,
    isSavingVariant,
    activeCatalogDetail,
    availableCatalogAttributes,
    attributeEditorRef,
    variantEditorRef,
    resetAttributeForm,
    resetVariantForm,
    openAttributeEditor,
    openVariantEditor,
    closeAttributeEditor,
    closeVariantEditor,
    handleCatalogAttributeChange,
    handleEditAttribute,
    handleDeleteAttribute,
    handleSaveAttribute,
    handleEditVariant,
    handleVariantSelectionChange,
    handleSaveVariant,
    handleToggleVariant,
  } = useProductManagementPanel({
    storeId,
    productId,
    onProductMutated,
  });

  if (isLoading) {
    return (
      <div className="rounded-none border-0 bg-transparent px-0 py-3 text-sm text-[var(--muted)] sm:rounded-2xl sm:border sm:border-[var(--line)] sm:bg-[var(--panel)] sm:px-4 sm:py-5">
        Cargando opciones y combinaciones del producto...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="rounded-none border-0 bg-transparent px-0 py-3 sm:rounded-2xl sm:border sm:border-[var(--line)] sm:bg-[var(--panel)] sm:px-4 sm:py-5">
        <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
          {error ?? "No se pudo cargar la configuración comercial del producto."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:rounded-[26px] sm:border sm:border-[var(--line)] sm:bg-[var(--panel)] sm:p-4 sm:shadow-[var(--shadow)]">
      <ProductManagementHeader product={product} currency={currency} />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <ProductManagementAttributesSection
          product={product}
          canManage={canManage}
          attributeForm={attributeForm}
          attributeFormError={attributeFormError}
          editingAttributeId={editingAttributeId}
          isAttributeEditorOpen={isAttributeEditorOpen}
          isSavingAttribute={isSavingAttribute}
          activeCatalogDetail={activeCatalogDetail}
          availableCatalogAttributes={availableCatalogAttributes}
          attributeEditorRef={attributeEditorRef}
          setAttributeForm={setAttributeForm}
          resetAttributeForm={resetAttributeForm}
          openAttributeEditor={openAttributeEditor}
          closeAttributeEditor={closeAttributeEditor}
          handleCatalogAttributeChange={handleCatalogAttributeChange}
          handleEditAttribute={handleEditAttribute}
          handleDeleteAttribute={handleDeleteAttribute}
          handleSaveAttribute={handleSaveAttribute}
        />

        <ProductManagementVariantsSection
          product={product}
          currency={currency}
          canManage={canManage}
          variantForm={variantForm}
          variantFormError={variantFormError}
          editingVariantId={editingVariantId}
          isVariantEditorOpen={isVariantEditorOpen}
          isSavingVariant={isSavingVariant}
          variantEditorRef={variantEditorRef}
          setVariantForm={setVariantForm}
          resetVariantForm={resetVariantForm}
          openVariantEditor={openVariantEditor}
          closeVariantEditor={closeVariantEditor}
          handleEditVariant={handleEditVariant}
          handleVariantSelectionChange={handleVariantSelectionChange}
          handleSaveVariant={handleSaveVariant}
          handleToggleVariant={handleToggleVariant}
        />
      </div>
    </div>
  );
}
