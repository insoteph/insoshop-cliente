"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import { useConfirmationDialog } from "@/modules/core/providers/ConfirmationDialogProvider";
import { useToast } from "@/modules/core/providers/ToastProvider";
import {
  createProduct,
  fetchProductAttributes,
  fetchProductById,
  fetchProducts,
  toggleProductStatus,
  updateProduct,
  type Product,
  type ProductDetail,
  type ProductPayload,
} from "@/modules/products/services/product-service";
import {
  mapProductAttributesToDrafts,
  mapProductVariantsToDrafts,
  validateVariantDrafts,
  extractCreatedProductId,
  alignVariantDraftsWithAttributes,
} from "@/modules/products/mappers/product-form.mapper";
import { INITIAL_PRODUCT_FORM } from "@/modules/products/types/product-form.types";
import type { ProductFormState } from "@/modules/products/types/product-form.types";
import {
  fetchCategories,
  type Category,
} from "@/modules/categories/services/category-service";
import {
  syncProductAttributes,
  syncProductVariants,
} from "@/modules/products/services/product-sync.service";

type UseProductsPanelParams = {
  storeId: number;
};

const FORM_ANIMATION_MS = 500;
const PRODUCT_DETAIL_CLOSE_MS = 240;
const PAGE_SIZE = 8;

export function useProductsPanel({ storeId }: UseProductsPanelParams) {
  const { confirm } = useConfirmationDialog();
  const toast = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "activos" | "inactivos" | "todos"
  >("todos");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isFormMounted, setIsFormMounted] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductFormState>(INITIAL_PRODUCT_FORM);
  const closeFormTimeoutRef = useRef<number | null>(null);
  const productDetailCloseTimeoutRef = useRef<number | null>(null);
  const productDetailRequestIdRef = useRef(0);
  const originalAttributeIdsRef = useRef<number[]>([]);
  const originalVariantIdsRef = useRef<number[]>([]);
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
        estadoFiltro: statusFilter,
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
  }, [page, search, statusFilter, storeId]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    void (async () => {
      try {
        const result = await fetchCategories({
          storeId,
          page: 1,
          pageSize: 100,
          estadoFiltro: "activos",
        });

        setCategories(result.items);
      } catch {
        setCategories([]);
      }
    })();
  }, [storeId]);

  const clearCloseFormTimeout = useCallback(() => {
    if (closeFormTimeoutRef.current) {
      window.clearTimeout(closeFormTimeoutRef.current);
      closeFormTimeoutRef.current = null;
    }
  }, []);

  const clearProductDetailCloseTimeout = useCallback(() => {
    if (productDetailCloseTimeoutRef.current) {
      window.clearTimeout(productDetailCloseTimeoutRef.current);
      productDetailCloseTimeoutRef.current = null;
    }
  }, []);

  const resetForm = useCallback(() => {
    setForm(INITIAL_PRODUCT_FORM);
    setEditingProductId(null);
    setFormError(null);
    originalAttributeIdsRef.current = [];
    originalVariantIdsRef.current = [];
  }, []);

  const resetProductDetailState = useCallback(() => {
    setSelectedProduct(null);
    setProductDetail(null);
    setProductDetailError(null);
    setIsProductDetailLoading(false);
  }, []);

  const openFormPanel = useCallback(() => {
    clearCloseFormTimeout();
    setIsFormMounted(true);
    window.requestAnimationFrame(() => {
      setIsFormVisible(true);
    });
  }, [clearCloseFormTimeout]);

  const closeFormPanel = useCallback(
    (shouldReset = true) => {
      setIsFormVisible(false);
      clearCloseFormTimeout();
      closeFormTimeoutRef.current = window.setTimeout(() => {
        setIsFormMounted(false);
        if (shouldReset) {
          resetForm();
        }
      }, FORM_ANIMATION_MS);
    },
    [clearCloseFormTimeout, resetForm],
  );

  useEffect(() => {
    return () => {
      clearCloseFormTimeout();
      clearProductDetailCloseTimeout();
    };
  }, [clearCloseFormTimeout, clearProductDetailCloseTimeout]);

  const handleCreateClick = useCallback(() => {
    resetForm();
    openFormPanel();
  }, [openFormPanel, resetForm]);

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

  const handleEditClick = useCallback(
    async (product: Product) => {
      setError(null);
      setFormError(null);
      originalAttributeIdsRef.current = [];
      originalVariantIdsRef.current = [];

      try {
        const productDetailResult = await fetchProductById(storeId, product.id);
        const productAttributes = await fetchProductAttributes(
          storeId,
          product.id,
        );
        const resolvedAttributes =
          productAttributes.length > 0
            ? productAttributes
            : (productDetailResult.atributos ?? []);

        setEditingProductId(product.id);
        setForm({
          nombre: productDetailResult.nombre,
          descripcion: productDetailResult.descripcion,
          categoriaId: productDetailResult.categoriaId,
          estado: productDetailResult.estado,
          atributos: mapProductAttributesToDrafts(resolvedAttributes),
          variantes: mapProductVariantsToDrafts(
            productDetailResult.variantes ?? [],
            resolvedAttributes,
          ),
        });
        originalAttributeIdsRef.current = resolvedAttributes
          .map((attribute) => attribute.id)
          .filter((attributeId) => attributeId > 0);
        originalVariantIdsRef.current = (productDetailResult.variantes ?? [])
          .map((variant) => variant.id)
          .filter((variantId) => variantId > 0);
        openFormPanel();
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudo cargar el detalle del producto.",
        );
      }
    },
    [openFormPanel, storeId],
  );

  useEffect(() => {
    setForm((current) => {
      const alignedVariants = alignVariantDraftsWithAttributes(
        current.variantes,
        current.atributos,
      );

      const isSame =
        current.variantes.length === alignedVariants.length &&
        current.variantes.every((variant, index) => {
          const nextVariant = alignedVariants[index];

          return (
            variant.key === nextVariant.key &&
            variant.id === nextVariant.id &&
            variant.precio === nextVariant.precio &&
            variant.cantidad === nextVariant.cantidad &&
            variant.estado === nextVariant.estado &&
            variant.urlImagen === nextVariant.urlImagen &&
            JSON.stringify(variant.valoresPorAtributo) ===
              JSON.stringify(nextVariant.valoresPorAtributo)
          );
        });

      if (isSame) {
        return current;
      }

      return {
        ...current,
        variantes: alignedVariants,
      };
    });
  }, [form.atributos]);

  const handleSaveProduct = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setFormError(null);

      if (!form.categoriaId) {
        setFormError("Debes seleccionar una categoria.");
        return;
      }

      const variantValidationError = validateVariantDrafts(
        form.variantes,
        form.atributos,
      );
      if (variantValidationError) {
        setFormError(variantValidationError);
        return;
      }

      setIsSaving(true);

      try {
        const payload: ProductPayload = {
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim(),
          categoriaId: form.categoriaId,
          estado: form.estado,
        };
        let productId = editingProductId;

        const isEditing = Boolean(editingProductId);

        if (editingProductId) {
          await updateProduct(editingProductId, storeId, payload);
          setForm((current) => ({ ...current, ...payload }));
        } else {
          const createdResponse = await createProduct(storeId, payload);
          productId = extractCreatedProductId(createdResponse.data);

          if (!productId) {
            throw new Error(
              "No se pudo identificar el producto creado para asociarle atributos.",
            );
          }
        }

        if (productId) {
          const persistedAttributes = await syncProductAttributes({
            storeId,
            productId,
            attributeDrafts: form.atributos,
            originalAttributeIds: originalAttributeIdsRef.current,
          });

          await syncProductVariants({
            storeId,
            productId,
            attributeDrafts: form.atributos,
            variantDrafts: form.variantes,
            persistedAttributes,
            originalVariantIds: originalVariantIdsRef.current,
          });
        }

        await loadProducts();
        toast.success(
          isEditing
            ? "Producto editado correctamente."
            : "Producto creado correctamente.",
          "Producto",
        );
        closeFormPanel(true);
      } catch (saveError) {
        setFormError(
          saveError instanceof Error
            ? saveError.message
            : "No se pudo guardar el producto.",
        );
      } finally {
        setIsSaving(false);
      }
    },
    [
      closeFormPanel,
      editingProductId,
      form,
      loadProducts,
      storeId,
      toast,
    ],
  );

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

  const handleStatusFilterChange = useCallback(
    (value: "activos" | "inactivos" | "todos") => {
      setPage(1);
      setStatusFilter(value);
    },
    [],
  );

  const handlePageChange = useCallback((nextPage: number) => {
    setPage(nextPage);
  }, []);

  return {
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
    setError,
    setFormError,
    setIsFormVisible,
    loadProducts,
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
    openFormPanel,
    closeFormPanel,
    resetForm,
  };
}
