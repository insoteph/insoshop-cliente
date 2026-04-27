"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";

import { MaterialInput } from "@/modules/core/components/MaterialInput";
import { formatCurrency } from "@/modules/core/lib/formatters";
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
  type ProductDetail,
  type ProductVariant,
} from "@/modules/products/services/product-service";

type ProductManagementPanelProps = {
  productId: number;
  storeId: number;
  currency: string;
  canManage: boolean;
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

function buildVariantSelectionMap(
  product: ProductDetail,
  variant: ProductVariant,
): Record<number, number> {
  return variant.valores.reduce<Record<number, number>>((accumulator, value) => {
    const productAttribute = product.atributos.find(
      (attribute) => attribute.id === value.productoAtributoId,
    );
    const attributeValue = productAttribute?.valores.find(
      (item) => item.atributoCatalogoValorId === value.atributoCatalogoValorId,
    );

    if (productAttribute && attributeValue) {
      accumulator[productAttribute.id] = attributeValue.id;
    }

    return accumulator;
  }, {});
}

function buildVariantSelectionKey(
  product: ProductDetail,
  variant: ProductVariant,
) {
  const selectionMap = buildVariantSelectionMap(product, variant);

  return product.atributos
    .map((attribute) => selectionMap[attribute.id])
    .filter((valueId): valueId is number => Number.isInteger(valueId))
    .sort((firstValue, secondValue) => firstValue - secondValue)
    .join("|");
}

function buildSelectedValuesKey(valueIds: number[]) {
  return [...valueIds]
    .sort((firstValue, secondValue) => firstValue - secondValue)
    .join("|");
}

function formatVariantValues(variant: ProductVariant) {
  return variant.valores.map((value) => value.valor).join(" / ");
}

function ColorSwatch({ colorHexadecimal }: { colorHexadecimal: string }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-3.5 w-3.5 rounded-full border border-black/10"
      style={{ backgroundColor: colorHexadecimal }}
    />
  );
}

export function ProductManagementPanel({
  productId,
  storeId,
  currency,
  canManage,
  onProductMutated,
}: ProductManagementPanelProps) {
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
  const [attributeForm, setAttributeForm] =
    useState<AttributeFormState>(INITIAL_ATTRIBUTE_FORM);
  const [variantForm, setVariantForm] =
    useState<VariantFormState>(INITIAL_VARIANT_FORM);
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
        const payload = {
          atributoCatalogoId: attributeForm.atributoCatalogoId,
          atributoCatalogoValorIds: [...attributeForm.atributoCatalogoValorIds],
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
        const payload = {
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

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-4 py-5 text-sm text-[var(--muted)]">
        Cargando opciones y combinaciones del producto...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-4 py-5">
        <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
          {error ?? "No se pudo cargar la configuración comercial del producto."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 rounded-[26px] border border-[var(--line)] bg-[var(--panel)] p-4 shadow-[var(--shadow)]">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Configuración de venta
          </p>
          <h3 className="text-xl font-semibold text-[var(--foreground-strong)]">
            {product.nombre}
          </h3>
          <p className="max-w-3xl text-sm text-[var(--muted)]">
            Primero define las opciones que verá tu cliente, como color o talla.
            Después crea las combinaciones reales que vas a vender con su
            precio, existencias e imagen.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
              Combinaciones
            </p>
            <p className="mt-1 text-lg font-semibold text-[var(--foreground-strong)]">
              {product.variantes.length}
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
              Stock total
            </p>
            <p className="mt-1 text-lg font-semibold text-[var(--foreground-strong)]">
              {product.cantidad}
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
              Precio desde
            </p>
            <p className="mt-1 text-lg font-semibold text-[var(--foreground-strong)]">
              {formatCurrency(product.precio, currency)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <section className="space-y-4 rounded-[24px] border border-[var(--line)] bg-[var(--panel-strong)] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-base font-semibold text-[var(--foreground-strong)]">
                Opciones del producto
              </h4>
              <p className="text-sm text-[var(--muted)]">
                Elige las opciones y valores que verá tu cliente en este
                producto, por ejemplo color, talla o material.
              </p>
            </div>
            {canManage ? (
              <button
                type="button"
                className="app-button-secondary inline-flex h-10 items-center rounded-xl px-3.5 text-sm font-semibold"
                onClick={() => {
                  resetAttributeForm();
                  openAttributeEditor();
                }}
              >
                Agregar opción
              </button>
            ) : null}
          </div>

          <div className="space-y-3">
            {product.atributos.length > 0 ? (
              product.atributos.map((attribute) => (
                <article
                  key={attribute.id}
                  className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-4 py-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--foreground-strong)]">
                        {attribute.atributoCatalogoNombre}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {attribute.valores.map((value) => (
                          <span
                            key={value.id}
                            className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]"
                          >
                            {value.colorHexadecimal ? (
                              <ColorSwatch
                                colorHexadecimal={value.colorHexadecimal}
                              />
                            ) : null}
                            {value.valor}
                          </span>
                        ))}
                      </div>
                    </div>

                    {canManage ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                        className="app-button-secondary inline-flex h-9 items-center rounded-xl px-3 text-xs font-semibold"
                          onClick={() => void handleEditAttribute(attribute)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                        className="app-button-danger inline-flex h-9 items-center rounded-xl px-3 text-xs font-semibold"
                          onClick={() => void handleDeleteAttribute(attribute)}
                        >
                          Quitar
                        </button>
                      </div>
                    ) : null}
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--panel)] px-4 py-6 text-sm text-[var(--muted)]">
                Este producto todavía no tiene opciones configuradas. Agrega
                color, talla u otras opciones antes de crear combinaciones de
                venta.
              </div>
            )}
          </div>

          {canManage ? (
            isAttributeEditorOpen ? (
              <div
                ref={attributeEditorRef}
                className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4"
              >
                <form className="space-y-4" onSubmit={handleSaveAttribute}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h5 className="text-sm font-semibold text-[var(--foreground-strong)]">
                        {editingAttributeId ? "Editar opción" : "Nueva opción"}
                      </h5>
                      <p className="text-sm text-[var(--muted)]">
                        Selecciona la opción general y luego marca los valores
                        que estarán disponibles en este producto.
                      </p>
                    </div>
                    <button
                      type="button"
                    className="app-button-secondary inline-flex h-10 items-center rounded-xl px-3.5 text-sm font-semibold"
                      onClick={closeAttributeEditor}
                    >
                      Cerrar
                    </button>
                  </div>

                  <select
                    value={attributeForm.atributoCatalogoId || ""}
                    onChange={(event) =>
                      void handleCatalogAttributeChange(Number(event.target.value))
                    }
                      className="app-input w-full rounded-2xl px-4 py-3 text-sm"
                  >
                    <option value="">Selecciona una opción</option>
                    {availableCatalogAttributes.map((attribute) => (
                      <option key={attribute.id} value={attribute.id}>
                        {attribute.nombre}
                      </option>
                    ))}
                  </select>

                  {activeCatalogDetail ? (
                    <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] p-4">
                      <p className="text-sm font-semibold text-[var(--foreground)]">
                        Valores disponibles para este producto
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {activeCatalogDetail.valores.map((value) => {
                          const isSelected =
                            attributeForm.atributoCatalogoValorIds.includes(
                              value.id,
                            );

                          return (
                            <button
                              key={value.id}
                              type="button"
                              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                                isSelected
                                  ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                                  : "border-[var(--line)] bg-[var(--panel)] text-[var(--foreground)]"
                              }`}
                              onClick={() =>
                                setAttributeForm((current) => ({
                                  ...current,
                                  atributoCatalogoValorIds: isSelected
                                    ? current.atributoCatalogoValorIds.filter(
                                        (valueId) => valueId !== value.id,
                                      )
                                    : [
                                        ...current.atributoCatalogoValorIds,
                                        value.id,
                                      ],
                                }))
                              }
                            >
                              <span className="inline-flex items-center gap-2">
                                {value.colorHexadecimal ? (
                                  <ColorSwatch
                                    colorHexadecimal={value.colorHexadecimal}
                                  />
                                ) : null}
                                {value.valor}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  {attributeFormError ? (
                    <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
                      {attributeFormError}
                    </p>
                  ) : null}

                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      className="app-button-secondary inline-flex h-10 items-center rounded-xl px-3.5 text-sm font-semibold"
                      onClick={resetAttributeForm}
                    >
                      Limpiar
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingAttribute}
                      className="app-button-primary inline-flex h-10 items-center rounded-xl px-4 text-sm font-semibold disabled:opacity-60"
                    >
                      {isSavingAttribute ? "Guardando..." : "Guardar opción"}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--panel)] px-4 py-5 text-sm text-[var(--muted)]">
                Usa <span className="font-semibold text-[var(--foreground)]">Agregar opción</span> para asociar al producto opciones como color, talla o material con los valores que aplican.
              </div>
            )
          ) : null}
        </section>

        <section className="space-y-4 rounded-[24px] border border-[var(--line)] bg-[var(--panel-strong)] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-base font-semibold text-[var(--foreground-strong)]">
                Combinaciones de venta
              </h4>
              <p className="text-sm text-[var(--muted)]">
                Cada combinación representa una presentación real que puedes
                vender: precio, existencias e imagen principal.
              </p>
            </div>
            {canManage ? (
              <button
                type="button"
                className="app-button-secondary inline-flex h-10 items-center rounded-xl px-3.5 text-sm font-semibold"
                onClick={() => {
                  resetVariantForm();
                  openVariantEditor();
                }}
                disabled={product.atributos.length === 0}
              >
                Agregar combinación
              </button>
            ) : null}
          </div>

          <div className="space-y-3">
            {product.variantes.length > 0 ? (
              product.variantes.map((variant) => (
                <article
                  key={variant.id}
                  className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4"
                >
                  <div className="grid gap-4 md:grid-cols-[88px_minmax(0,1fr)_auto] md:items-center">
                    <div className="h-20 w-20 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)]">
                      {variant.urlImagenPrincipal ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={variant.urlImagenPrincipal}
                          alt={formatVariantValues(variant) || `Combinación ${variant.id}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                          SIN IMAGEN
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {variant.valores.map((value) => (
                          <span
                            key={`${variant.id}-${value.productoAtributoId}-${value.atributoCatalogoValorId}`}
                            className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--panel-muted)] px-3 py-1 text-xs font-semibold text-[var(--foreground)]"
                          >
                            {value.colorHexadecimal ? (
                              <ColorSwatch
                                colorHexadecimal={value.colorHexadecimal}
                              />
                            ) : null}
                            {value.atributoCatalogoNombre}: {value.valor}
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="font-semibold text-[var(--foreground-strong)]">
                          {formatCurrency(variant.precio, currency)}
                        </span>
                        <span className="text-[var(--muted)]">
                          Stock: {variant.cantidad}
                        </span>
                        <span
                          className={
                            variant.estado
                              ? "text-[var(--success)]"
                              : "text-[var(--danger)]"
                          }
                        >
                          {variant.estado ? "Activa" : "Inactiva"}
                        </span>
                      </div>
                    </div>

                    {canManage ? (
                      <div className="flex flex-wrap gap-2 md:justify-end">
                        <button
                          type="button"
                          className="app-button-secondary inline-flex h-9 items-center rounded-xl px-3 text-xs font-semibold"
                          onClick={() => handleEditVariant(variant)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className={`inline-flex h-9 items-center rounded-xl px-3 text-xs font-semibold ${
                            variant.estado
                              ? "app-button-danger"
                              : "app-button-primary"
                          }`}
                          onClick={() => void handleToggleVariant(variant)}
                        >
                          {variant.estado ? "Inactivar" : "Activar"}
                        </button>
                      </div>
                    ) : null}
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--panel)] px-4 py-6 text-sm text-[var(--muted)]">
                Aún no existen combinaciones de venta para este producto.
              </div>
            )}
          </div>

          {canManage ? (
            isVariantEditorOpen ? (
              <div
                ref={variantEditorRef}
                className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4"
              >
                <form className="space-y-4" onSubmit={handleSaveVariant}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h5 className="text-sm font-semibold text-[var(--foreground-strong)]">
                        {editingVariantId
                          ? "Editar combinación"
                          : "Nueva combinación"}
                      </h5>
                      <p className="text-sm text-[var(--muted)]">
                        Selecciona un valor por cada opción y define el precio,
                        las existencias y la imagen de esta combinación.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="app-button-secondary inline-flex h-10 items-center rounded-xl px-3.5 text-sm font-semibold"
                      onClick={closeVariantEditor}
                    >
                      Cerrar
                    </button>
                  </div>

                  <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3 text-sm text-[var(--muted)]">
                    {product.atributos.length > 0 ? (
                      <span>
                        Opciones disponibles en este producto:{" "}
                        <span className="font-semibold text-[var(--foreground)]">
                          {product.atributos
                            .map((attribute) => attribute.atributoCatalogoNombre)
                            .join(", ")}
                        </span>
                      </span>
                    ) : (
                      <span>
                        Primero agrega al menos una opción del producto para
                        poder crear combinaciones de venta.
                      </span>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <MaterialInput
                      id={`variant-price-${product.id}`}
                      label="Precio"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={variantForm.precio}
                      onChange={(event) =>
                        setVariantForm((current) => ({
                          ...current,
                          precio: event.target.value,
                        }))
                      }
                      required
                    />
                    <MaterialInput
                      id={`variant-stock-${product.id}`}
                      label="Existencias"
                      type="number"
                      min="0"
                      value={variantForm.cantidad}
                      onChange={(event) =>
                        setVariantForm((current) => ({
                          ...current,
                          cantidad: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {product.atributos.map((attribute) => (
                      <select
                        key={attribute.id}
                        value={variantForm.seleccionPorAtributo[attribute.id] || ""}
                        onChange={(event) =>
                          handleVariantSelectionChange(
                            attribute.id,
                            Number(event.target.value),
                          )
                        }
                        className="app-input w-full rounded-2xl px-4 py-3 text-sm"
                      >
                        <option value="">
                          Selecciona {attribute.atributoCatalogoNombre}
                        </option>
                        {attribute.valores.map((value) => (
                          <option key={value.id} value={value.id}>
                            {value.valor}
                          </option>
                        ))}
                      </select>
                    ))}
                  </div>

                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_180px]">
                    <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--panel-muted)] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[var(--foreground)]">
                            Imagen principal de esta combinación
                          </p>
                          <p className="text-sm text-[var(--muted)]">
                            Usa una imagen que represente visualmente esta
                            combinación.
                          </p>
                        </div>
                        <button
                          type="button"
                          className="app-button-primary inline-flex h-10 items-center rounded-xl px-3.5 text-sm font-semibold disabled:opacity-60"
                          onClick={() => variantImageInputRef.current?.click()}
                          disabled={isUploadingVariantImage}
                        >
                          {isUploadingVariantImage
                            ? "Subiendo..."
                            : "Subir imagen"}
                        </button>
                      </div>
                      <input
                        ref={variantImageInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="sr-only"
                        onChange={(event) =>
                          void handleVariantImageUpload(
                            event.target.files?.[0] ?? null,
                          )
                        }
                      />
                    </div>

                    <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] p-3">
                      <div className="h-32 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)]">
                        {variantForm.urlImagen.trim() ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={variantForm.urlImagen.trim()}
                            alt="Vista previa de combinación"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                            SIN IMAGEN
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <label className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3 text-sm text-[var(--foreground)]">
                    <input
                      type="checkbox"
                      checked={variantForm.estado}
                      onChange={(event) =>
                        setVariantForm((current) => ({
                          ...current,
                          estado: event.target.checked,
                        }))
                      }
                    />
                    Combinación activa
                  </label>

                  {variantFormError ? (
                    <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
                      {variantFormError}
                    </p>
                  ) : null}

                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      className="app-button-secondary inline-flex h-10 items-center rounded-xl px-3.5 text-sm font-semibold"
                      onClick={resetVariantForm}
                    >
                      Limpiar
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingVariant || product.atributos.length === 0}
                      className="app-button-primary inline-flex h-10 items-center rounded-xl px-4 text-sm font-semibold disabled:opacity-60"
                    >
                      {isSavingVariant ? "Guardando..." : "Guardar combinación"}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--panel)] px-4 py-5 text-sm text-[var(--muted)]">
                Usa <span className="font-semibold text-[var(--foreground)]">Agregar combinación</span> para definir cada presentación real de venta con su precio, existencias e imagen.
              </div>
            )
          ) : null}
        </section>
      </div>
    </div>
  );
}
