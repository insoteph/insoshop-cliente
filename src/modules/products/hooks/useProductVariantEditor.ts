"use client";

import { useCallback, useRef, useState, type RefObject } from "react";

import { useConfirmationDialog } from "@/modules/core/providers/ConfirmationDialogProvider";
import { useToast } from "@/modules/core/providers/ToastProvider";
import {
  createProductVariants,
  toggleProductVariantStatus,
  type ProductDetail,
  type ProductVariant,
  type ProductVariantPayload,
  updateProductVariant,
} from "@/modules/products/services/product-service";
import {
  buildSelectedValuesKey,
  buildVariantSelectionKey,
  buildVariantSelectionMap,
  formatVariantValues,
} from "@/modules/products/mappers/product-form.mapper";

type VariantFormState = {
  precio: string;
  cantidad: string;
  estado: boolean;
  urlImagen: string;
  seleccionPorAtributo: Record<number, number>;
};

type UseProductVariantEditorParams = {
  storeId: number;
  productId: number;
  product: ProductDetail | null;
  refreshAfterMutation: () => Promise<void>;
};

const INITIAL_VARIANT_FORM: VariantFormState = {
  precio: "",
  cantidad: "",
  estado: true,
  urlImagen: "",
  seleccionPorAtributo: {},
};

export function useProductVariantEditor({
  storeId,
  productId,
  product,
  refreshAfterMutation,
}: UseProductVariantEditorParams) {
  const { confirm } = useConfirmationDialog();
  const toast = useToast();
  const variantEditorRef = useRef<HTMLDivElement | null>(null);

  const [variantFormError, setVariantFormError] = useState<string | null>(null);
  const [editingVariantId, setEditingVariantId] = useState<number | null>(null);
  const [variantForm, setVariantForm] = useState<VariantFormState>(
    INITIAL_VARIANT_FORM,
  );
  const [isVariantEditorOpen, setIsVariantEditorOpen] = useState(false);
  const [isSavingVariant, setIsSavingVariant] = useState(false);

  const focusEditor = useCallback((editorRef: RefObject<HTMLDivElement | null>) => {
    window.requestAnimationFrame(() => {
      editorRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, []);

  const resetVariantForm = useCallback(() => {
    setEditingVariantId(null);
    setVariantForm(INITIAL_VARIANT_FORM);
    setVariantFormError(null);
  }, []);

  const openVariantEditor = useCallback(() => {
    setIsVariantEditorOpen(true);
    focusEditor(variantEditorRef);
  }, [focusEditor]);

  const closeVariantEditor = useCallback(() => {
    resetVariantForm();
    setIsVariantEditorOpen(false);
  }, [resetVariantForm]);

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
    variantFormError,
    editingVariantId,
    variantForm,
    setVariantForm,
    isVariantEditorOpen,
    isSavingVariant,
    variantEditorRef,
    resetVariantForm,
    openVariantEditor,
    closeVariantEditor,
    handleEditVariant,
    handleVariantSelectionChange,
    handleSaveVariant,
    handleToggleVariant,
  };
}
