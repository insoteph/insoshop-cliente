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
  deleteProductAttribute,
  type ProductAttribute,
  type ProductAttributeDraftPayload,
  type ProductDetail,
  updateProductAttribute,
} from "@/modules/products/services/product-service";

type AttributeFormState = {
  atributoCatalogoId: number;
  atributoCatalogoValorIds: number[];
};

type UseProductAttributeEditorParams = {
  storeId: number;
  productId: number;
  product: ProductDetail | null;
  refreshAfterMutation: () => Promise<void>;
  closeVariantEditor: () => void;
};

const INITIAL_ATTRIBUTE_FORM: AttributeFormState = {
  atributoCatalogoId: 0,
  atributoCatalogoValorIds: [],
};

export function useProductAttributeEditor({
  storeId,
  productId,
  product,
  refreshAfterMutation,
  closeVariantEditor,
}: UseProductAttributeEditorParams) {
  const { confirm } = useConfirmationDialog();
  const toast = useToast();
  const attributeEditorRef = useRef<HTMLDivElement | null>(null);

  const [catalogAttributes, setCatalogAttributes] = useState<CatalogAttribute[]>(
    [],
  );
  const [catalogDetails, setCatalogDetails] = useState<
    Record<number, CatalogAttributeDetail>
  >({});
  const [attributeFormError, setAttributeFormError] = useState<string | null>(
    null,
  );
  const [editingAttributeId, setEditingAttributeId] = useState<number | null>(
    null,
  );
  const [attributeForm, setAttributeForm] = useState<AttributeFormState>(
    INITIAL_ATTRIBUTE_FORM,
  );
  const [isAttributeEditorOpen, setIsAttributeEditorOpen] = useState(false);
  const [isSavingAttribute, setIsSavingAttribute] = useState(false);

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
    void loadCatalog();
  }, [loadCatalog]);

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

  const closeAttributeEditor = useCallback(() => {
    resetAttributeForm();
    setIsAttributeEditorOpen(false);
  }, [resetAttributeForm]);

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

  return {
    attributeFormError,
    editingAttributeId,
    attributeForm,
    setAttributeForm,
    isAttributeEditorOpen,
    isSavingAttribute,
    activeCatalogDetail,
    availableCatalogAttributes,
    attributeEditorRef,
    resetAttributeForm,
    openAttributeEditor,
    closeAttributeEditor,
    handleCatalogAttributeChange,
    handleEditAttribute,
    handleDeleteAttribute,
    handleSaveAttribute,
  };
}
