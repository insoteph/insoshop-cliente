"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  DataTable,
  type DataTableBadgeConfig,
  type DataTableColumn,
} from "@/modules/core/components/DataTable";
import {
  DataTableToolbar,
  ToolbarActions,
  type DataTableToolbarAction,
} from "@/modules/core/components/DataTableToolbar";
import { SearchBar } from "@/modules/core/components/SearchBar";
import {
  ProductFormPanel,
  type ProductFormState,
} from "@/modules/products/components/ProductFormPanel";
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
import { formatCurrency } from "@/modules/core/lib/formatters";

type ProductsPanelProps = {
  storeId: number;
  canManage: boolean;
  currency: string;
};

const INITIAL_FORM: ProductFormState = {
  nombre: "",
  descripcion: "",
  categoriaId: 0,
  precio: "",
  cantidad: "",
  estado: true,
  imagenes: [],
};

const FORM_ANIMATION_MS = 500;

export function ProductsPanel({
  storeId,
  canManage,
  currency,
}: ProductsPanelProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
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
  }, [page, pageSize, search, storeId]);

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
        precio: String(product.precio),
        cantidad: String(product.cantidad),
        estado: product.estado,
        imagenes: product.imagenes,
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

      if (form.imagenes.length < 3) {
        setFormError("Cada producto necesita al menos 3 imagenes.");
        return;
      }

      setIsSaving(true);

      try {
        const payload = {
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim(),
          categoriaId: form.categoriaId,
          precio: Number(form.precio),
          cantidad: Number(form.cantidad),
          estado: form.estado,
          imagenes: form.imagenes,
        };

        if (editingProductId) {
          await updateProduct(editingProductId, storeId, payload);
        } else {
          await createProduct(storeId, payload);
        }

        closeFormPanel(true);
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
    [closeFormPanel, editingProductId, form, loadProducts, storeId],
  );

  const handleToggleStatus = useCallback(
    async (product: Product) => {
      const nextAction = product.estado ? "inactivar" : "activar";
      if (!window.confirm(`Deseas ${nextAction} este producto?`)) {
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
    [loadProducts, storeId],
  );

  const columns = useMemo<DataTableColumn<Product>[]>(
    () => [
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
        header: "Precio",
        textFormatter: (value: unknown) =>
          formatCurrency(Number(value ?? 0), currency),
      },
      {
        key: "cantidad",
        header: "Stock",
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
            textClassName: "text-emerald-700",
            backgroundClassName: "bg-emerald-100",
          },
          {
            value: false,
            label: "Inactivo",
            iconPath: "/icons/cross.svg",
            textClassName: "text-slate-700",
            backgroundClassName: "bg-slate-200",
          },
        ],
      },
    ],
    [],
  );

  const rowActions = canManage
    ? {
        primaryButtonLabel: "Editar",
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
              label: "Nuevo Producto",
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
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="w-full">
            <SearchBar
              value={search}
              onChange={(value) => {
                setPage(1);
                setSearch(value);
              }}
              placeholder="Buscar por nombre o descripcion"
              ariaLabel="Buscar productos"
            />
          </div>
          <ToolbarActions actions={toolbarActions} className="md:shrink-0" />
        </div>

        {error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}
      </div>

      {isFormMounted ? (
        <ProductFormPanel
          isVisible={isFormVisible}
          editingProductId={editingProductId}
          isSaving={isSaving}
          formError={formError}
          form={form}
          categories={categories}
          onClose={() => closeFormPanel(true)}
          onSubmit={handleSubmit}
          onNombreChange={(value) =>
            setForm((current) => ({ ...current, nombre: value }))
          }
          onCategoriaChange={(value) =>
            setForm((current) => ({ ...current, categoriaId: value }))
          }
          onPrecioChange={(value) =>
            setForm((current) => ({ ...current, precio: value }))
          }
          onCantidadChange={(value) =>
            setForm((current) => ({ ...current, cantidad: value }))
          }
          onDescripcionChange={(value) =>
            setForm((current) => ({ ...current, descripcion: value }))
          }
          onEstadoChange={(value) =>
            setForm((current) => ({ ...current, estado: value }))
          }
          onImagenesChange={(imagenes) =>
            setForm((current) => ({ ...current, imagenes }))
          }
        />
      ) : null}

      <div className="rounded-md bg-white py-2 shadow-lg">
        <DataTableToolbar
          pageSize={pageSize}
          onPageSizeChange={(value) => {
            setPage(1);
            setPageSize(value);
          }}
        />
        <div className="mb-2 mt-1 border-b-[1px] border-slate-200"></div>
        <div className="px-3">
          <DataTable
            headers={columns}
            data={products}
            isLoading={isLoading}
            rowKey="id"
            emptyMessage="No hay productos registrados para esta tienda."
            badges={stateBadges}
            rowActions={rowActions}
            pagination={{
              page,
              totalPages,
              totalRecords,
              onPageChange: setPage,
            }}
          />
        </div>
      </div>
    </section>
  );
}
