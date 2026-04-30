"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";

import { useConfirmationDialog } from "@/modules/core/providers/ConfirmationDialogProvider";
import { useToast } from "@/modules/core/providers/ToastProvider";
import {
  fetchCatalogAttributeById,
  fetchCatalogAttributes,
  type CatalogAttribute,
  type CatalogAttributeDetail,
} from "@/modules/attribute-catalog/services/attribute-catalog-service";
import {
  createProductAttribute,
  createProductVariants,
  deleteProductAttribute,
  fetchProductById,
  toggleProductVariantStatus,
  updateProductAttribute,
  updateProductVariant,
  uploadProductImage,
  type ProductAttribute,
  type ProductAttributeDraftPayload,
  type ProductDetail,
  type ProductVariant,
  type ProductVariantPayload,
} from "@/modules/products/services/product-service";
import {
  buildSelectedValuesKey,
  buildVariantSelectionKey,
  buildVariantSelectionMap,
  formatVariantValues,
} from "@/modules/products/mappers/product-form.mapper";

type ProductManagementPanelParams = {
  storeId: number;
  productId: number;
  onProductMutated: () => Promise<void> | void;
};

type AttributeFormState = {
  atributoCatalogoId: number;
  atributoCatalogoValorIds: number[];
};

type VariantFormState = {
  precio: string;
  cantidad: string;
  estado: boolean;
  urlImagen: string;
  seleccionPorAtributo: Record<number, number>;
};

const INITIAL_ATTRIBUTE_FORM: AttributeFormState = {
  atributoCatalogoId: 0,
  atributoCatalogoValorIds: [],
};

const INITIAL_VARIANT_FORM: VariantFormState = {
  precio: "",
  cantidad: "",
  estado: true,
  urlImagen: "",
  seleccionPorAtributo: {},
};

export function useProductManagementPanel({
  storeId,
  productId,
  onProductMutated,
}: ProductManagementPanelParams) {
  const { confirm } = useConfirmationDialog();
  const toast = useToast();
  const variantImageInputRef = useRef<HTMLInputElement | null>(null);
  const attributeEditorRef = useRef<HTMLDivElement | null>(null);
  const variantEditorRef = useRef<HTMLDivElement | null>(null);

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [catalogAttributes, setCatalogAttributes] = useState<CatalogAttribute[]>(
    [],
  );
  const [catalogDetails, setCatalogDetails] = useState<
    Record<number, CatalogAttributeDetail>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attributeFormError, setAttributeFormError] = useState<string | null>(
    null,
  );
  const [variantFormError, setVariantFormError] = useState<string | null>(null);
  const [editingAttributeId, setEditingAttributeId] = useState<number | null>(
    null,
  );
  const [editingVariantId, setEditingVariantId] = useState<number | null>(null);
  const [attributeForm, setAttributeForm] = useState<AttributeFormState>(
    INITIAL_ATTRIBUTE_FORM,
  );
  const [variantForm, setVariantForm] = useState<VariantFormState>(
    INITIAL_VARIANT_FORM,
  );
  const [isAttributeEditorOpen, setIsAttributeEditorOpen] = useState(false);
  const [isVariantEditorOpen, setIsVariantEditorOpen] = useState(false);
  const [isSavingAttribute, setIsSavingAttribute] = useState(false);
  const [isSavingVariant, setIsSavingVariant] = useState(false);
  const [isUploadingVariantImage, setIsUploadingVariantImage] = useState(false);

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

  const loadCatalog = useCallback(async () => {
    try {
      const result = await fetchCatalogAttributes({
        page: 1,
        pageSize: 200,
        estadoFiltro: "todos",
      });
      setCatalogAttributes(result.items);
    } catch {
      setCatalogAttributes([]);
    }
  }, []);

  useEffect(() => {
    void Promise.all([loadProduct(), loadCatalog()]);
  }, [loadCatalog, loadProduct]);

  const ensureCatalogDetail = useCallback(
    async (attributeId: number) => {
      const cached = catalogDetails[attributeId];
      if (cached) {
        return cached;
      }

      const detail = await fetchCatalogAttributeById(attributeId);
      setCatalogDetails((current) => ({
        ...current,
        [attributeId]: detail,
      }));

      return detail;
    },
    [catalogDetails],
  );

  const activeCatalogDetail = catalogDetails[attributeForm.atributoCatalogoId];

  const availableCatalogAttributes = useMemo(() => {
    if (!product) {
      return catalogAttributes;
    }

    const usedIds = new Set(
      product.atributos
        .filter((attribute) => attribute.id !== editingAttributeId)
        .map((attribute) => attribute.atributoCatalogoId),
    );

    return catalogAttributes.filter(
      (attribute) =>
        !usedIds.has(attribute.id) &&
        (attribute.estado || attribute.id === attributeForm.atributoCatalogoId),
    );
  }, [
    attributeForm.atributoCatalogoId,
    catalogAttributes,
    editingAttributeId,
    product,
  ]);

  const resetAttributeForm = useCallback(() => {
    setEditingAttributeId(null);
    setAttributeForm(INITIAL_ATTRIBUTE_FORM);
    setAttributeFormError(null);
  }, []);

  const resetVariantForm = useCallback(() => {
    setEditingVariantId(null);
    setVariantForm(INITIAL_VARIANT_FORM);
    setVariantFormError(null);
    if (variantImageInputRef.current) {
      variantImageInputRef.current.value = "";
    }
  }, []);

  const focusEditor = useCallback((editorRef: RefObject<HTMLDivElement | null>) => {
    window.requestAnimationFrame(() => {
      editorRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, []);

  const openAttributeEditor = useCallback(() => {
    setIsAttributeEditorOpen(true);
    focusEditor(attributeEditorRef);
  }, [focusEditor]);

  const openVariantEditor = useCallback(() => {
    setIsVariantEditorOpen(true);
    focusEditor(variantEditorRef);
  }, [focusEditor]);

  const closeAttributeEditor = useCallback(() => {
    resetAttributeForm();
    setIsAttributeEditorOpen(false);
  }, [resetAttributeForm]);

  const closeVariantEditor = useCallback(() => {
    resetVariantForm();
    setIsVariantEditorOpen(false);
  }, [resetVariantForm]);

  const refreshAfterMutation = useCallback(async () => {
    await loadProduct();
    await onProductMutated();
  }, [loadProduct, onProductMutated]);

  const handleCatalogAttributeChange = useCallback(
    async (attributeId: number) => {
      setAttributeForm((current) => ({
        ...current,
        atributoCatalogoId: attributeId,
        atributoCatalogoValorIds: [],
      }));
      setAttributeFormError(null);

      if (attributeId > 0) {
        try {
          await ensureCatalogDetail(attributeId);
        } catch (loadError) {
          setAttributeFormError(
            loadError instanceof Error
              ? loadError.message
              : "No se pudieron cargar los valores de esta opción.",
          );
        }
      }
    },
    [ensureCatalogDetail],
  );

  const handleEditAttribute = useCallback(
    async (attribute: ProductAttribute) => {
      setIsAttributeEditorOpen(true);
      setEditingAttributeId(attribute.id);
      setAttributeForm({
        atributoCatalogoId: attribute.atributoCatalogoId,
        atributoCatalogoValorIds: attribute.valores.map(
          (value) => value.atributoCatalogoValorId,
        ),
      });
      setAttributeFormError(null);

      try {
        await ensureCatalogDetail(attribute.atributoCatalogoId);
      } catch (loadError) {
        setAttributeFormError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudo cargar el detalle de la opción.",
        );
      }

      focusEditor(attributeEditorRef);
    },
    [ensureCatalogDetail, focusEditor],
  );

  const handleDeleteAttribute = useCallback(
    async (attribute: ProductAttribute) => {
      const shouldContinue = await confirm({
        title: "Quitar opción del producto",
        description: `Se quitará "${attribute.atributoCatalogoNombre}" del producto y cualquier combinación relacionada tendrá que ajustarse.`,
        confirmLabel: "Quitar",
        variant: "danger",
      });

      if (!shouldContinue) {
        return;
      }

      try {
        await deleteProductAttribute(storeId, productId, attribute.id);
        closeAttributeEditor();
        closeVariantEditor();
        await refreshAfterMutation();
        toast.success(
          "Atributo del producto eliminado correctamente.",
          "Producto",
        );
      } catch (deleteError) {
        setAttributeFormError(
          deleteError instanceof Error
            ? deleteError.message
            : "No se pudo quitar la opción del producto.",
        );
      }
    },
    [
      closeAttributeEditor,
      closeVariantEditor,
      confirm,
      productId,
      refreshAfterMutation,
      storeId,
      toast,
    ],
  );

  const handleSaveAttribute = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setAttributeFormError(null);

      if (!attributeForm.atributoCatalogoId) {
        setAttributeFormError("Selecciona una opción general.");
        return;
      }

      if (attributeForm.atributoCatalogoValorIds.length === 0) {
        setAttributeFormError("Selecciona al menos un valor para esta opción.");
        return;
      }

      setIsSavingAttribute(true);

      try {
        const payload: ProductAttributeDraftPayload = {
          atributoCatalogoId: attributeForm.atributoCatalogoId,
          atributoCatalogoValorIds: [
            ...attributeForm.atributoCatalogoValorIds,
          ],
        };

        if (editingAttributeId) {
          await updateProductAttribute(
            storeId,
            productId,
            editingAttributeId,
            payload,
          );
          toast.success(
            "Atributo del producto editado correctamente.",
            "Producto",
          );
        } else {
          await createProductAttribute(storeId, productId, payload);
          toast.success(
            "Atributo del producto creado correctamente.",
            "Producto",
          );
        }

        closeAttributeEditor();
        closeVariantEditor();
        await refreshAfterMutation();
      } catch (saveError) {
        setAttributeFormError(
          saveError instanceof Error
            ? saveError.message
            : "No se pudo guardar la opción del producto.",
        );
      } finally {
        setIsSavingAttribute(false);
      }
    },
    [
      attributeForm,
      closeAttributeEditor,
      closeVariantEditor,
      editingAttributeId,
      productId,
      refreshAfterMutation,
      storeId,
      toast,
    ],
  );

  const handleEditVariant = useCallback(
    (variant: ProductVariant) => {
      if (!product) {
        return;
      }

      setIsVariantEditorOpen(true);
      setEditingVariantId(variant.id);
      setVariantForm({
        precio: String(variant.precio),
        cantidad: String(variant.cantidad),
        estado: variant.estado,
        urlImagen: variant.urlImagenPrincipal ?? variant.imagenes[0] ?? "",
        seleccionPorAtributo: buildVariantSelectionMap(product, variant),
      });
      setVariantFormError(null);
      focusEditor(variantEditorRef);
    },
    [focusEditor, product],
  );

  const handleVariantSelectionChange = useCallback(
    (productAttributeId: number, productAttributeValueId: number) => {
      setVariantForm((current) => ({
        ...current,
        seleccionPorAtributo: {
          ...current.seleccionPorAtributo,
          [productAttributeId]: productAttributeValueId,
        },
      }));
      setVariantFormError(null);
    },
    [],
  );

  const handleVariantImageUpload = useCallback(
    async (file: File | null) => {
      if (!file) {
        return;
      }

      setIsUploadingVariantImage(true);
      setVariantFormError(null);

      try {
        const result = await uploadProductImage(file);
        setVariantForm((current) => ({
          ...current,
          urlImagen: result.url,
        }));
      } catch (uploadError) {
        setVariantFormError(
          uploadError instanceof Error
            ? uploadError.message
            : "No se pudo subir la imagen de esta combinación.",
        );
      } finally {
        setIsUploadingVariantImage(false);
        if (variantImageInputRef.current) {
          variantImageInputRef.current.value = "";
        }
      }
    },
    [],
  );

  const handleSaveVariant = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setVariantFormError(null);

      if (!product || product.atributos.length === 0) {
        setVariantFormError(
          "Primero debes definir las opciones del producto antes de crear combinaciones de venta.",
        );
        return;
      }

      const selectedValueIds = product.atributos
        .map((attribute) => variantForm.seleccionPorAtributo[attribute.id])
        .filter((valueId): valueId is number => Number.isInteger(valueId));

      if (selectedValueIds.length !== product.atributos.length) {
        setVariantFormError(
          "Selecciona un valor para cada opción antes de guardar esta combinación.",
        );
        return;
      }

      setIsSavingVariant(true);

      try {
        const payload: ProductVariantPayload = {
          precio: Number(variantForm.precio),
          cantidad: Number(variantForm.cantidad),
          estado: variantForm.estado,
          urlImagen: variantForm.urlImagen.trim() || null,
          productoAtributoValorIds: selectedValueIds,
        };

        const existingVariant = product.variantes.find(
          (variant) =>
            variant.id !== editingVariantId &&
            buildVariantSelectionKey(product, variant) ===
              buildSelectedValuesKey(selectedValueIds),
        );
        const variantIdToUpdate = editingVariantId ?? existingVariant?.id;

        if (variantIdToUpdate) {
          await updateProductVariant(
            storeId,
            productId,
            variantIdToUpdate,
            payload,
          );
          toast.success("Variante editada correctamente.", "Producto");
        } else {
          await createProductVariants(storeId, productId, {
            variantes: [payload],
          });
          toast.success("Variante creada correctamente.", "Producto");
        }

        closeVariantEditor();
        await refreshAfterMutation();
      } catch (saveError) {
        setVariantFormError(
          saveError instanceof Error
            ? saveError.message
            : "No se pudo guardar la combinación.",
        );
      } finally {
        setIsSavingVariant(false);
      }
    },
    [
      closeVariantEditor,
      editingVariantId,
      product,
      productId,
      refreshAfterMutation,
      storeId,
      toast,
      variantForm,
    ],
  );

  const handleToggleVariant = useCallback(
    async (variant: ProductVariant) => {
      const shouldContinue = await confirm({
        title: "Cambiar estado de combinación",
        description: `La combinación "${formatVariantValues(variant) || `#${variant.id}`}" pasará a estado ${variant.estado ? "inactivo" : "activo"}.`,
        confirmLabel: variant.estado ? "Inactivar" : "Activar",
        variant: variant.estado ? "danger" : "primary",
      });

      if (!shouldContinue) {
        return;
      }

      try {
        await toggleProductVariantStatus(
          productId,
          variant.id,
          storeId,
          !variant.estado,
        );
        await refreshAfterMutation();
        toast.success(
          variant.estado
            ? "Variante inactivada correctamente."
            : "Variante activada correctamente.",
          "Producto",
        );
      } catch (toggleError) {
        setVariantFormError(
          toggleError instanceof Error
            ? toggleError.message
            : "No se pudo actualizar el estado de la combinación.",
        );
      }
    },
    [confirm, productId, refreshAfterMutation, storeId, toast],
  );

  return {
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
    isUploadingVariantImage,
    activeCatalogDetail,
    availableCatalogAttributes,
    variantImageInputRef,
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
    handleVariantImageUpload,
    handleSaveVariant,
    handleToggleVariant,
  };
}
