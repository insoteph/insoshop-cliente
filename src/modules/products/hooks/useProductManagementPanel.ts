"use client";

import { useCallback, useEffect, useState } from "react";

import {
  fetchProductById,
  type ProductDetail,
} from "@/modules/products/services/product-service";
import { useProductAttributeEditor } from "@/modules/products/hooks/useProductAttributeEditor";
import { useProductVariantEditor } from "@/modules/products/hooks/useProductVariantEditor";

type ProductManagementPanelParams = {
  storeId: number;
  productId: number;
  onProductMutated: () => Promise<void> | void;
};

export function useProductManagementPanel({
  storeId,
  productId,
  onProductMutated,
}: ProductManagementPanelParams) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProduct = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchProductById(storeId, productId);
      setProduct(result);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudo cargar la configuración del producto.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [productId, storeId]);

  useEffect(() => {
    void loadProduct();
  }, [loadProduct]);

  const refreshAfterMutation = useCallback(async () => {
    await loadProduct();
    await onProductMutated();
  }, [loadProduct, onProductMutated]);

  const variantEditor = useProductVariantEditor({
    storeId,
    productId,
    product,
    refreshAfterMutation,
  });

  const attributeEditor = useProductAttributeEditor({
    storeId,
    productId,
    product,
    refreshAfterMutation,
    closeVariantEditor: variantEditor.closeVariantEditor,
  });

  return {
    product,
    isLoading,
    error,
    ...attributeEditor,
    ...variantEditor,
  };
}
