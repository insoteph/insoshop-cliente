"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";

import { fetchCategories, type Category } from "@/modules/categories/services/category-service";
import { useToast } from "@/modules/core/providers/ToastProvider";
import {
  alignVariantDraftsWithAttributes,
  extractCreatedProductId,
  mapProductAttributesToDrafts,
  mapProductVariantsToDrafts,
  validateVariantDrafts,
} from "@/modules/products/mappers/product-form.mapper";
import {
  createProduct,
  fetchProductAttributes,
  fetchProductById,
  type ProductDetail,
  type ProductPayload,
  updateProduct,
} from "@/modules/products/services/product-service";
import {
  syncProductAttributes,
  syncProductVariants,
} from "@/modules/products/services/product-sync.service";
import { INITIAL_PRODUCT_FORM } from "@/modules/products/types/product-form.types";
import type { ProductFormState } from "@/modules/products/types/product-form.types";

type UseProductEditorParams = {
  storeId: number;
  mode: "create" | "edit";
  productId?: number;
  onSaved?: () => void | Promise<void>;
};

type ProductEditorState = {
  categories: Category[];
  product: ProductDetail | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  formError: string | null;
  editingProductId: number | null;
  form: ProductFormState;
  setForm: Dispatch<SetStateAction<ProductFormState>>;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

export function useProductEditor({
  storeId,
  mode,
  productId,
  onSaved,
}: UseProductEditorParams): ProductEditorState {
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<number | null>(
    mode === "edit" ? productId ?? null : null,
  );
  const [form, setForm] = useState<ProductFormState>(INITIAL_PRODUCT_FORM);
  const originalAttributeIdsRef = useRef<number[]>([]);
  const originalVariantIdsRef = useRef<number[]>([]);

  const resetReferences = useCallback(() => {
    originalAttributeIdsRef.current = [];
    originalVariantIdsRef.current = [];
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadEditorData() {
      setIsLoading(true);
      setError(null);
      setFormError(null);

      try {
        const categoriesPromise = fetchCategories({
          storeId,
          page: 1,
          pageSize: 100,
          estadoFiltro: "activos",
        });

        if (mode === "create") {
          const categoriesResult = await categoriesPromise;

          if (!isActive) {
            return;
          }

          setCategories(categoriesResult.items);
          setProduct(null);
          setEditingProductId(null);
          setForm(INITIAL_PRODUCT_FORM);
          resetReferences();
          return;
        }

        if (!productId || !Number.isInteger(productId) || productId <= 0) {
          throw new Error("El producto solicitado no es valido.");
        }

        const [categoriesResult, productResult, productAttributes] =
          await Promise.all([
            categoriesPromise,
            fetchProductById(storeId, productId),
            fetchProductAttributes(storeId, productId),
          ]);

        if (!isActive) {
          return;
        }

        const resolvedAttributes =
          productAttributes.length > 0
            ? productAttributes
            : (productResult.atributos ?? []);

        setCategories(categoriesResult.items);
        setProduct(productResult);
        setEditingProductId(productResult.id);
        setForm({
          nombre: productResult.nombre,
          descripcion: productResult.descripcion,
          categoriaId: productResult.categoriaId,
          estado: productResult.estado,
          atributos: mapProductAttributesToDrafts(resolvedAttributes),
          variantes: mapProductVariantsToDrafts(
            productResult.variantes ?? [],
            resolvedAttributes,
          ),
        });
        originalAttributeIdsRef.current = resolvedAttributes
          .map((attribute) => attribute.id)
          .filter((attributeId) => attributeId > 0);
        originalVariantIdsRef.current = (productResult.variantes ?? [])
          .map((variant) => variant.id)
          .filter((variantId) => variantId > 0);
      } catch (loadError) {
        if (!isActive) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudo cargar el formulario del producto.",
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadEditorData();

    return () => {
      isActive = false;
    };
  }, [mode, productId, resetReferences, storeId]);

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

  const handleSubmit = useCallback(
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
        if (mode === "edit" && !editingProductId) {
          throw new Error("No se pudo resolver el producto a editar.");
        }

        const payload: ProductPayload = {
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim(),
          categoriaId: form.categoriaId,
          estado: form.estado,
        };
        let nextProductId = editingProductId;
        const isEditing = mode === "edit";

        if (isEditing && editingProductId) {
          await updateProduct(editingProductId, storeId, payload);
        } else {
          const createdResponse = await createProduct(storeId, payload);
          nextProductId = extractCreatedProductId(createdResponse.data);

          if (!nextProductId) {
            throw new Error(
              "No se pudo identificar el producto creado para asociarle atributos.",
            );
          }
        }

        if (nextProductId) {
          const persistedAttributes = await syncProductAttributes({
            storeId,
            productId: nextProductId,
            attributeDrafts: form.atributos,
            originalAttributeIds: originalAttributeIdsRef.current,
          });

          await syncProductVariants({
            storeId,
            productId: nextProductId,
            attributeDrafts: form.atributos,
            variantDrafts: form.variantes,
            persistedAttributes,
            originalVariantIds: originalVariantIdsRef.current,
          });
        }

        toast.success(
          isEditing ? "Producto editado correctamente." : "Producto creado correctamente.",
          "Producto",
        );
        await onSaved?.();
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
    [editingProductId, form, mode, onSaved, storeId, toast],
  );

  return {
    categories,
    product,
    isLoading,
    isSaving,
    error,
    formError,
    editingProductId,
    form,
    setForm,
    handleSubmit,
  };
}
