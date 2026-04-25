"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  DataTable,
  type DataTableBadgeConfig,
  type DataTableColumn,
} from "@/modules/core/components/DataTable";
import { SearchBar } from "@/modules/core/components/SearchBar";
import {
  ToolbarActions,
  type DataTableToolbarAction,
} from "@/modules/core/components/DataTableToolbar";
import { formatCurrency } from "@/modules/core/lib/formatters";
import { useConfirmationDialog } from "@/modules/core/providers/ConfirmationDialogProvider";
import {
  ProductFormPanel,
  type ProductFormState,
} from "@/modules/products/components/ProductFormPanel";
import { ProductManagementPanel } from "@/modules/products/components/ProductManagementPanel";
import { type ProductAttributeDraft } from "@/modules/products/components/ProductAttributesPanel";
import {
  createProduct,
  createProductAttribute,
  createProductVariants,
  deleteProductAttribute,
  deleteProductVariant,
  fetchProductById,
  fetchProductAttributes,
  fetchProducts,
  toggleProductStatus,
  updateProduct,
  updateProductAttribute,
  updateProductVariant,
  type Product,
  type ProductAttribute,
  type ProductAttributeDraftPayload,
  type ProductPayload,
  type ProductVariant,
  type ProductVariantDraft,
  type ProductVariantPayload,
} from "@/modules/products/services/product-service";
import {
  fetchCategories,
  type Category,
} from "@/modules/categories/services/category-service";

type ProductsPanelProps = {
  storeId: number;
  canCreateProducts: boolean;
  canEditProducts: boolean;
  canDeleteProducts: boolean;
  canEditAttributes: boolean;
  canDeleteAttributes: boolean;
  currency: string;
};

const INITIAL_FORM: ProductFormState = {
  nombre: "",
  descripcion: "",
  categoriaId: 0,
  estado: true,
};

const FORM_ANIMATION_MS = 500;

function extractCreatedProductId(data: unknown): number | null {
  if (typeof data === "number" && Number.isFinite(data)) {
    return data;
  }

  if (typeof data === "object" && data !== null) {
    const candidate = data as Record<string, unknown>;
    const keys = ["id", "productoId", "productId"];

    for (const key of keys) {
      const value = candidate[key];
      if (typeof value === "number" && Number.isFinite(value)) {
        return value;
      }
    }

    if ("data" in candidate) {
      return extractCreatedProductId(candidate.data);
    }
  }

  return null;
}

function buildAttributePayloads(
  attributeDrafts: ProductAttributeDraft[],
): ProductAttributeDraftPayload[] {
  return attributeDrafts
    .filter(
      (draft) =>
        draft.atributoCatalogoId > 0 &&
        draft.atributoCatalogoValorIds.length > 0,
    )
    .map((draft) => ({
      atributoCatalogoId: draft.atributoCatalogoId,
      atributoCatalogoValorIds: draft.atributoCatalogoValorIds,
    }));
}

function mapProductAttributesToDrafts(
  attributes: ProductAttribute[],
): ProductAttributeDraft[] {
  return attributes.map((attribute) => ({
    key:
      globalThis.crypto?.randomUUID?.() ??
      `id-${attribute.id}-${attribute.atributoCatalogoId}-${Date.now()}`,
    id: attribute.id,
    atributoCatalogoId: attribute.atributoCatalogoId,
    atributoCatalogoValorIds: attribute.valores
      .map((value) => value.atributoCatalogoValorId)
      .filter((valueId) => valueId > 0),
  }));
}

function createVariantDraftKey() {
  return (
    globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random()}`
  );
}

function mapProductVariantsToDrafts(
  variants: ProductVariant[],
  attributes: ProductAttribute[],
): ProductVariantDraft[] {
  const productAttributeById = new Map(
    attributes.map((attribute) => [attribute.id, attribute.atributoCatalogoId]),
  );

  return variants.map((variant) => ({
    key: createVariantDraftKey(),
    id: variant.id,
    precio: String(variant.precio ?? ""),
    cantidad: String(variant.cantidad ?? ""),
    estado: variant.estado,
    urlImagen: variant.urlImagenPrincipal?.trim() || null,
    valoresPorAtributo: variant.valores.reduce<Record<number, string>>(
      (result, value) => {
        const attributeId = productAttributeById.get(value.productoAtributoId);
        if (attributeId && attributeId > 0) {
          result[attributeId] = String(value.atributoCatalogoValorId);
        }

        return result;
      },
      {},
    ),
  }));
}

function alignVariantDraftsWithAttributes(
  variants: ProductVariantDraft[],
  attributes: ProductAttributeDraft[],
) {
  const activeAttributeIds = attributes
    .map((attribute) => attribute.atributoCatalogoId)
    .filter((attributeId) => attributeId > 0);

  return variants.map((variant) => {
    const nextValues: Record<number, string> = {};

    activeAttributeIds.forEach((attributeId) => {
      nextValues[attributeId] = variant.valoresPorAtributo[attributeId] ?? "";
    });

    return {
      ...variant,
      valoresPorAtributo: nextValues,
    };
  });
}

function buildVariantPayload(
  variant: ProductVariantDraft,
  attributes: ProductAttributeDraft[],
) {
  const attributeIds = attributes
    .map((attribute) => attribute.atributoCatalogoId)
    .filter((attributeId) => attributeId > 0);

  const selectedValues: number[] = [];
  const valuesByAttribute = new Map(
    Object.entries(variant.valoresPorAtributo).map(([key, value]) => [
      Number(key),
      value,
    ]),
  );

  attributeIds.forEach((attributeId) => {
    const valueId = Number(valuesByAttribute.get(attributeId) || 0);
    if (valueId > 0) {
      selectedValues.push(valueId);
    }
  });

  return {
    precio: Number(variant.precio),
    cantidad: Number(variant.cantidad),
    estado: variant.estado,
    urlImagen: variant.urlImagen?.trim() || null,
    productoAtributoValorIds: selectedValues,
  };
}

function validateVariantDrafts(
  variants: ProductVariantDraft[],
  attributes: ProductAttributeDraft[],
) {
  const activeAttributes = attributes.filter(
    (attribute) => attribute.atributoCatalogoId > 0,
  );

  if (activeAttributes.length === 0) {
    return variants.length > 0
      ? "Debes agregar atributos antes de definir variantes."
      : null;
  }

  if (variants.length === 0) {
    return "Debes agregar al menos una variante.";
  }

  const duplicateChecker = new Set<string>();

  for (const variant of variants) {
    const precio = Number(variant.precio);
    const cantidad = Number(variant.cantidad);

    if (!Number.isFinite(precio) || precio <= 0) {
      return "Cada variante debe tener un precio mayor que cero.";
    }

    if (!Number.isInteger(cantidad) || cantidad < 0) {
      return "Cada variante debe tener una cantidad valida.";
    }

    const values: number[] = [];

    for (const attribute of activeAttributes) {
      const valueId = Number(
        variant.valoresPorAtributo[attribute.atributoCatalogoId] || 0,
      );
      if (!valueId) {
        return "Cada variante debe contener un valor para cada atributo.";
      }

      values.push(valueId);
    }

    const signature = values.join("|");
    if (duplicateChecker.has(signature)) {
      return "No puedes repetir la misma combinacion de atributos.";
    }

    duplicateChecker.add(signature);
  }

  return null;
}

export function ProductsPanel({
  storeId,
  canCreateProducts,
  canEditProducts,
  canDeleteProducts,
  canEditAttributes,
  canDeleteAttributes,
  currency,
}: ProductsPanelProps) {
  const { confirm } = useConfirmationDialog();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);
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
  const [form, setForm] = useState<ProductFormState>(INITIAL_FORM);
  const closeFormTimeoutRef = useRef<number | null>(null);
  const originalAttributeIdsRef = useRef<number[]>([]);
  const originalVariantIdsRef = useRef<number[]>([]);
  const canManage =
    canEditProducts ||
    canDeleteProducts ||
    canEditAttributes ||
    canDeleteAttributes;

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchProducts({
        storeId,
        page,
        pageSize,
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
  }, [page, pageSize, search, statusFilter, storeId]);

  const loadCategories = useCallback(async () => {
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
  }, [storeId]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const resetForm = useCallback(() => {
    setForm(INITIAL_FORM);
    setEditingProductId(null);
    setFormError(null);
    originalAttributeIdsRef.current = [];
    originalVariantIdsRef.current = [];
  }, []);

  const clearCloseFormTimeout = useCallback(() => {
    if (closeFormTimeoutRef.current) {
      window.clearTimeout(closeFormTimeoutRef.current);
      closeFormTimeoutRef.current = null;
    }
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
    };
  }, [clearCloseFormTimeout]);
  const handleCreateClick = useCallback(() => {
    resetForm();
    openFormPanel();
  }, [openFormPanel, resetForm]);

  const handleEditClick = useCallback(
    async (product: Product) => {
      setEditingProductId(product.id);
      setForm({
        nombre: product.nombre,
        descripcion: product.descripcion,
        categoriaId: product.categoriaId,
        estado: product.estado,
      });
      setFormError(null);
      originalAttributeIdsRef.current = [];
      originalVariantIdsRef.current = [];

      try {
        const productDetail = await fetchProductById(storeId, product.id);
        const productAttributes = await fetchProductAttributes(
          storeId,
          product.id,
        );
        const resolvedAttributes =
          productAttributes.length > 0
            ? productAttributes
            : (productDetail.atributos ?? []);

        setEditingProductId(product.id);
        setForm({
          nombre: productDetail.nombre,
          descripcion: productDetail.descripcion,
          categoriaId: productDetail.categoriaId,
          estado: productDetail.estado,
        });
        originalAttributeIdsRef.current = resolvedAttributes
          .map((attribute) => attribute.id)
          .filter((attributeId) => attributeId > 0);
        originalVariantIdsRef.current = (productDetail.variantes ?? [])
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

  const syncProductAttributes = useCallback(
    async (productId: number, attributeDrafts: ProductAttributeDraft[]) => {
      const normalizedDrafts = attributeDrafts.filter(
        (draft) => draft.atributoCatalogoId > 0,
      );
      const activeAttributeIds = new Set(
        normalizedDrafts
          .map((draft) => draft.id)
          .filter(
            (attributeId): attributeId is number =>
              typeof attributeId === "number" && attributeId > 0,
          ),
      );

      const operations: Promise<unknown>[] = [];

      for (const draft of normalizedDrafts) {
        const payload: ProductAttributeDraftPayload = {
          atributoCatalogoId: draft.atributoCatalogoId,
          atributoCatalogoValorIds: draft.atributoCatalogoValorIds,
        };

        if (draft.atributoCatalogoValorIds.length === 0) {
          if (draft.id) {
            operations.push(
              deleteProductAttribute(storeId, productId, draft.id),
            );
          }

          continue;
        }

        if (draft.id) {
          operations.push(
            updateProductAttribute(storeId, productId, draft.id, payload),
          );
        } else {
          operations.push(createProductAttribute(storeId, productId, payload));
        }
      }

      for (const originalAttributeId of originalAttributeIdsRef.current) {
        if (!activeAttributeIds.has(originalAttributeId)) {
          operations.push(
            deleteProductAttribute(storeId, productId, originalAttributeId),
          );
        }
      }

      if (operations.length > 0) {
        await Promise.all(operations);
      }
    },
    [storeId],
  );

  const syncProductVariants = useCallback(
    async (
      productId: number,
      attributeDrafts: ProductAttributeDraft[],
      variantDrafts: ProductVariantDraft[],
    ) => {
      const normalizedAttributes = attributeDrafts.filter(
        (draft) => draft.atributoCatalogoId > 0,
      );
      const normalizedVariants = variantDrafts.filter(
        (draft) => draft.key.length > 0,
      );

      if (normalizedAttributes.length === 0) {
        if (normalizedVariants.length > 0) {
          throw new Error(
            "Debes agregar atributos antes de definir variantes.",
          );
        }

        return;
      }

      if (normalizedVariants.length === 0) {
        throw new Error("Debes agregar al menos una variante.");
      }

      const originalVariantIds = new Set(originalVariantIdsRef.current);
      const activeVariantIds = new Set<number>();
      const createPayload: ProductVariantPayload[] = [];
      const updatePayloads: Array<{
        id: number;
        payload: ProductVariantPayload;
      }> = [];
      const signatures = new Set<string>();

      for (const variantDraft of normalizedVariants) {
        const payload = buildVariantPayload(variantDraft, normalizedAttributes);

        if (
          payload.productoAtributoValorIds.length !==
          normalizedAttributes.length
        ) {
          throw new Error(
            "Cada variante debe contener un valor para cada atributo.",
          );
        }

        const signature = payload.productoAtributoValorIds
          .slice()
          .sort((a, b) => a - b)
          .join("|");

        if (signatures.has(signature)) {
          throw new Error(
            "No puedes repetir la misma combinacion de atributos.",
          );
        }

        signatures.add(signature);

        if (variantDraft.id && variantDraft.id > 0) {
          activeVariantIds.add(variantDraft.id);
          updatePayloads.push({ id: variantDraft.id, payload });
          continue;
        }

        createPayload.push(payload);
      }

      const deleteIds = Array.from(originalVariantIds).filter(
        (variantId) => !activeVariantIds.has(variantId),
      );

      const operations: Promise<unknown>[] = [];

      if (createPayload.length > 0) {
        operations.push(
          createProductVariants(storeId, productId, {
            variantes: createPayload,
          }),
        );
      }

      updatePayloads.forEach(({ id, payload }) => {
        operations.push(updateProductVariant(storeId, productId, id, payload));
      });

      deleteIds.forEach((variantId) => {
        operations.push(deleteProductVariant(storeId, productId, variantId));
      });

      if (operations.length > 0) {
        await Promise.all(operations);
      }
    },
    [storeId],
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setFormError(null);

      if (!form.categoriaId) {
        setFormError("Debes seleccionar una categoria.");
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
        if (editingProductId) {
          await updateProduct(editingProductId, storeId, payload);
          setForm(payload);
        } else {
          const created = await createProduct(storeId, payload);
          setEditingProductId(created.id);
          setForm(payload);
        }

        await loadProducts();
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
    [editingProductId, form, loadProducts, storeId],
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
      } catch (toggleError) {
        setError(
          toggleError instanceof Error
            ? toggleError.message
            : "No se pudo actualizar el estado del producto.",
        );
      }
    },
    [confirm, loadProducts, storeId],
  );

  const columns = useMemo<DataTableColumn<Product>[]>(
    () => [
      {
        key: "imagenes",
        header: "Imagen",
        render: (product) => {
          const imageUrl = product.imagenes[0]?.url?.trim();

          if (!imageUrl) {
            return (
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                Sin imagen
              </span>
            );
          }

          return (
            <div className="h-14 w-14 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={product.nombre}
                className="h-full w-full object-cover"
              />
            </div>
          );
        },
      },
      {
        key: "nombre",
        header: "Producto",
        className: "font-semibold",
      },
      {
        key: "categoriaNombre",
        header: "Categoria",
      },
      {
        key: "precio",
        header: "Precio desde",
        textFormatter: (value: unknown) =>
          formatCurrency(Number(value ?? 0), currency),
      },
      {
        key: "cantidad",
        header: "Stock total",
      },
      {
        key: "estado",
        header: "Estado",
      },
    ],
    [currency],
  );

  const stateBadges = useMemo<Array<DataTableBadgeConfig<Product>>>(
    () => [
      {
        columnKey: "estado",
        rules: [
          {
            value: true,
            label: "Activo",
            iconPath: "/icons/check.svg",
            textClassName: "app-badge-success",
            backgroundClassName: "",
          },
          {
            value: false,
            label: "Inactivo",
            iconPath: "/icons/cross.svg",
            textClassName: "app-badge-neutral",
            backgroundClassName: "",
          },
        ],
      },
    ],
    [],
  );

  const rowActions = canManage
    ? {
        primaryButtonLabel: () => "Editar",
        onPrimaryAction: handleEditClick,
        dropdownOptions: [
          {
            label: (product: Product) =>
              product.estado ? "Inactivar" : "Activar",
            onClick: handleToggleStatus,
          },
        ],
      }
    : undefined;

  const toolbarActions = useMemo<DataTableToolbarAction[]>(
    () =>
      canCreateProducts
        ? [
            {
              label: "Nuevo producto",
              iconPath: "/icons/plus.svg",
              onClick: handleCreateClick,
            },
          ]
        : [],
    [canCreateProducts, handleCreateClick],
  );

  return (
    <section className="space-y-5">
      <div className="space-y-4 rounded-md border border-[var(--line)] bg-[var(--panel)] p-5 shadow-md">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="w-full">
            <SearchBar
              value={search}
              onChange={(value) => {
                setPage(1);
                setSearch(value);
              }}
              placeholder="Buscar por nombre o descripción del producto"
              ariaLabel="Buscar productos"
            />
          </div>
          <ToolbarActions actions={toolbarActions} className="xl:shrink-0" />
        </div>

        <div className="grid gap-3 md:grid-cols-[220px] md:justify-end">
          <select
            value={statusFilter}
            onChange={(event) => {
              setPage(1);
              setStatusFilter(
                event.target.value as "activos" | "inactivos" | "todos",
              );
            }}
            className="app-input rounded-2xl px-4 py-3 text-sm"
          >
            <option value="todos">Todos los estados</option>
            <option value="activos">Solo activos</option>
            <option value="inactivos">Solo inactivos</option>
          </select>
        </div>

        {error ? (
          <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
            {error}
          </p>
        ) : null}
      </div>

      {isFormMounted ? (
        <ProductFormPanel
          storeId={storeId}
          isVisible={isFormVisible}
          editingProductId={editingProductId}
          configuredProductId={editingProductId}
          isSaving={isSaving}
          formError={formError}
          form={form}
          categories={categories}
          configurationContent={
            editingProductId ? (
              <ProductManagementPanel
                productId={editingProductId}
                storeId={storeId}
                currency={currency}
                canManage={canManage}
                onProductMutated={loadProducts}
              />
            ) : undefined
          }
          onClose={() => closeFormPanel(true)}
          onSubmit={handleSubmit}
          onNombreChange={(value) =>
            setForm((current) => ({ ...current, nombre: value }))
          }
          onCategoriaChange={(value) =>
            setForm((current) => ({ ...current, categoriaId: value }))
          }
          onDescripcionChange={(value) =>
            setForm((current) => ({ ...current, descripcion: value }))
          }
          onEstadoChange={(value) =>
            setForm((current) => ({ ...current, estado: value }))
          }
        />
      ) : null}

      <DataTable
        headers={columns}
        rows={products}
        rowKey="id"
        isLoading={isLoading}
        emptyMessage="Todavía no hay productos registrados para esta tienda."
        badges={stateBadges}
        rowActions={rowActions}
        pagination={{
          page,
          totalPages,
          totalRecords,
          onPageChange: (nextPage) => {
            setPage(nextPage);
          },
        }}
      />
    </section>
  );
}
