"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useConfirmationDialog } from "@/modules/core/providers/ConfirmationDialogProvider";
import { useToast } from "@/modules/core/providers/ToastProvider";
import {
  fetchProductAttributes,
  fetchProductById,
  fetchProducts,
  toggleProductStatus,
  type Product,
  type ProductDetail,
} from "@/modules/products/services/product-service";

type UseProductsPanelParams = {
  storeId: number;
};

const PRODUCT_DETAIL_CLOSE_MS = 240;
const PAGE_SIZE = 8;

export function useProductsPanel({ storeId }: UseProductsPanelParams) {
  const { confirm } = useConfirmationDialog();
  const toast = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const productDetailCloseTimeoutRef = useRef<number | null>(null);
  const productDetailRequestIdRef = useRef(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);
  const [productDetail, setProductDetail] = useState<ProductDetail | null>(null);
  const [isProductDetailLoading, setIsProductDetailLoading] = useState(false);
  const [productDetailError, setProductDetailError] = useState<string | null>(
    null,
  );

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchProducts({
        storeId,
        page,
        pageSize: PAGE_SIZE,
        search,
      });

      setProducts(result.items);
      setTotalPages(result.totalPages);
      setTotalRecords(result.totalRecords);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudieron cargar los productos.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, search, storeId]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const clearProductDetailCloseTimeout = useCallback(() => {
    if (productDetailCloseTimeoutRef.current) {
      window.clearTimeout(productDetailCloseTimeoutRef.current);
      productDetailCloseTimeoutRef.current = null;
    }
  }, []);

  const resetProductDetailState = useCallback(() => {
    setSelectedProduct(null);
    setProductDetail(null);
    setProductDetailError(null);
    setIsProductDetailLoading(false);
  }, []);

  useEffect(() => {
    return () => {
      clearProductDetailCloseTimeout();
    };
  }, [clearProductDetailCloseTimeout]);

  const handleOpenProductDetail = useCallback(
    async (product: Product) => {
      clearProductDetailCloseTimeout();
      const requestId = productDetailRequestIdRef.current + 1;
      productDetailRequestIdRef.current = requestId;

      setSelectedProduct(product);
      setIsProductDetailOpen(true);
      setProductDetail(null);
      setProductDetailError(null);
      setIsProductDetailLoading(true);

      try {
        const [productDetailResult, productAttributes] = await Promise.all([
          fetchProductById(storeId, product.id),
          fetchProductAttributes(storeId, product.id),
        ]);

        if (requestId !== productDetailRequestIdRef.current) {
          return;
        }

        setProductDetail({
          ...productDetailResult,
          atributos:
            productAttributes.length > 0
              ? productAttributes
              : productDetailResult.atributos,
        });
      } catch (loadError) {
        if (requestId !== productDetailRequestIdRef.current) {
          return;
        }

        setProductDetailError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudo cargar el detalle del producto.",
        );
      } finally {
        if (requestId === productDetailRequestIdRef.current) {
          setIsProductDetailLoading(false);
        }
      }
    },
    [clearProductDetailCloseTimeout, storeId],
  );

  const handleCloseProductDetail = useCallback(() => {
    setIsProductDetailOpen(false);
    setIsProductDetailLoading(false);
    setProductDetailError(null);
    productDetailRequestIdRef.current += 1;
    clearProductDetailCloseTimeout();
    productDetailCloseTimeoutRef.current = window.setTimeout(() => {
      resetProductDetailState();
    }, PRODUCT_DETAIL_CLOSE_MS);
  }, [clearProductDetailCloseTimeout, resetProductDetailState]);

  const handleRetryProductDetail = useCallback(() => {
    if (!selectedProduct) {
      return;
    }

    void handleOpenProductDetail(selectedProduct);
  }, [handleOpenProductDetail, selectedProduct]);

  const handleToggleStatus = useCallback(
    async (product: Product) => {
      const nextAction = product.estado ? "inactivar" : "activar";
      const shouldContinue = await confirm({
        title: "Confirmar accion",
        description: `Deseas ${nextAction} este producto?`,
        confirmLabel: product.estado ? "Inactivar" : "Activar",
        variant: product.estado ? "danger" : "primary",
      });

      if (!shouldContinue) {
        return;
      }

      try {
        await toggleProductStatus(product.id, storeId);
        await loadProducts();
        toast.success(
          product.estado
            ? "Producto inactivado correctamente."
            : "Producto activado correctamente.",
          "Producto",
        );
      } catch (toggleError) {
        setError(
          toggleError instanceof Error
            ? toggleError.message
            : "No se pudo actualizar el estado del producto.",
        );
      }
    },
    [confirm, loadProducts, storeId, toast],
  );

  const handleSearchChange = useCallback((value: string) => {
    setPage(1);
    setSearch(value);
  }, []);

  const handlePageChange = useCallback((nextPage: number) => {
    setPage(nextPage);
  }, []);

  return {
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
  };
}
