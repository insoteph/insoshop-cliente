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
import {
  createProduct,
  fetchProducts,
  toggleProductStatus,
  updateProduct,
  type Product,
} from "@/modules/products/services/product-service";
import {
  fetchCategories,
  type Category,
} from "@/modules/categories/services/category-service";

type ProductsPanelProps = {
  storeId: number;
  canManage: boolean;
  currency: string;
};

const INITIAL_FORM: ProductFormState = {
  nombre: "",
  descripcion: "",
  categoriaId: 0,
  estado: true,
};

const FORM_ANIMATION_MS = 500;

export function ProductsPanel({
  storeId,
  canManage,
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
    (product: Product) => {
      setEditingProductId(product.id);
      setForm({
        nombre: product.nombre,
        descripcion: product.descripcion,
        categoriaId: product.categoriaId,
        estado: product.estado,
      });
      setFormError(null);
      openFormPanel();
    },
    [openFormPanel],
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
        const payload = {
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
      canManage
        ? [
            {
              label: "Nuevo producto",
              iconPath: "/icons/plus.svg",
              onClick: handleCreateClick,
            },
          ]
        : [],
    [canManage, handleCreateClick],
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
