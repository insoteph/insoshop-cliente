"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { DataTable } from "@/modules/core/components/DataTable";
import { ProductImageUploader } from "@/modules/products/components/ProductImageUploader";
import {
  createProduct,
  fetchProducts,
  toggleProductStatus,
  updateProduct,
  type Product,
  type ProductImagePayload,
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

type ProductFormState = {
  nombre: string;
  descripcion: string;
  categoriaId: number;
  precio: string;
  cantidad: string;
  estado: boolean;
  imagenes: ProductImagePayload[];
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

export function ProductsPanel({
  storeId,
  canManage,
  currency,
}: ProductsPanelProps) {
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
  const [showForm, setShowForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductFormState>(INITIAL_FORM);

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
          : "No se pudieron cargar los productos."
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

  function resetForm() {
    setForm(INITIAL_FORM);
    setEditingProductId(null);
    setFormError(null);
  }

  function handleCreateClick() {
    resetForm();
    setShowForm(true);
  }

  function handleEditClick(product: Product) {
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
    setShowForm(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (!form.categoriaId) {
      setFormError("Debes seleccionar una categoría.");
      return;
    }

    if (form.imagenes.length < 3) {
      setFormError("Cada producto necesita al menos 3 imágenes.");
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

      resetForm();
      setShowForm(false);
      await loadProducts();
    } catch (saveError) {
      setFormError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo guardar el producto."
      );
    } finally {
      setIsSaving(false);
    }
  }

  const handleToggleStatus = useCallback(async (product: Product) => {
    const action = product.estado ? "desactivar" : "activar";
    if (!window.confirm(`¿Deseas ${action} este producto?`)) {
      return;
    }

    try {
      await toggleProductStatus(product.id, storeId);
      await loadProducts();
    } catch (toggleError) {
      setError(
        toggleError instanceof Error
          ? toggleError.message
          : "No se pudo actualizar el estado del producto."
      );
    }
  }, [loadProducts, storeId]);

  const columns = useMemo(
    () => [
      {
        key: "nombre",
        header: "Producto",
        render: (product: Product) => (
          <div className="space-y-1">
            <p className="font-semibold text-[var(--foreground)]">
              {product.nombre}
            </p>
            <p className="text-xs text-[var(--muted)] line-clamp-2">
              {product.descripcion || "Sin descripción"}
            </p>
          </div>
        ),
      },
      {
        key: "categoriaNombre",
        header: "Categoría",
      },
      {
        key: "precio",
        header: "Precio",
        render: (product: Product) => formatCurrency(product.precio, currency),
      },
      {
        key: "cantidad",
        header: "Stock",
      },
      {
        key: "estado",
        header: "Estado",
        render: (product: Product) => (
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
              product.estado
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-200 text-slate-700"
            }`}
          >
            {product.estado ? "Activo" : "Inactivo"}
          </span>
        ),
      },
      {
        key: "acciones",
        header: "Acciones",
        render: (product: Product) => (
          <div className="flex flex-wrap gap-2">
            {canManage ? (
              <>
                <button
                  type="button"
                  className="rounded-xl border border-[var(--line)] px-3 py-2 text-xs font-semibold text-[var(--foreground)]"
                  onClick={() => handleEditClick(product)}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-[var(--line)] px-3 py-2 text-xs font-semibold text-[var(--foreground)]"
                  onClick={() => handleToggleStatus(product)}
                >
                  {product.estado ? "Inactivar" : "Activar"}
                </button>
              </>
            ) : (
              <span className="text-xs text-[var(--muted)]">
                Solo lectura
              </span>
            )}
          </div>
        ),
      },
    ],
    [canManage, currency, handleToggleStatus]
  );

  return (
    <section className="space-y-5">
      <div className="space-y-4 rounded-md border border-[var(--line)] bg-[var(--panel)] p-5 shadow-lg">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[var(--foreground)]">
              Productos de la tienda
            </h3>
            <p className="text-sm text-[var(--muted)]">
              Controla catálogo, precios, imágenes y disponibilidad.
            </p>
          </div>

          {canManage ? (
            <button
              type="button"
              className="rounded-2xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white"
              onClick={handleCreateClick}
            >
              Nuevo producto
            </button>
          ) : null}
        </div>

        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
          <input
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            placeholder="Buscar por nombre o descripción"
            className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3 text-sm text-[var(--foreground)] outline-none"
          />
          <select
            value={statusFilter}
            onChange={(event) => {
              setPage(1);
              setStatusFilter(
                event.target.value as "activos" | "inactivos" | "todos"
              );
            }}
            className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3 text-sm text-[var(--foreground)] outline-none"
          >
            <option value="todos">Todos los estados</option>
            <option value="activos">Solo activos</option>
            <option value="inactivos">Solo inactivos</option>
          </select>
        </div>

        {error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}
      </div>

      {showForm ? (
        <form
          className="space-y-4 rounded-md border border-[var(--line)] bg-[var(--panel)] p-5 shadow-lg"
          onSubmit={handleSubmit}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h4 className="text-lg font-semibold text-[var(--foreground)]">
                {editingProductId ? "Editar producto" : "Crear producto"}
              </h4>
              <p className="text-sm text-[var(--muted)]">
                Reutiliza las categorías de la tienda y carga al menos 3
                imágenes.
              </p>
            </div>
            <button
              type="button"
              className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-[var(--foreground)]"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
            >
              Cerrar
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              required
              value={form.nombre}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  nombre: event.target.value,
                }))
              }
              placeholder="Nombre del producto"
              className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3 text-sm text-[var(--foreground)] outline-none"
            />
            <select
              required
              value={form.categoriaId || ""}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  categoriaId: Number(event.target.value),
                }))
              }
              className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3 text-sm text-[var(--foreground)] outline-none"
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.nombre}
                </option>
              ))}
            </select>
            <input
              required
              min="0.01"
              step="0.01"
              type="number"
              value={form.precio}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  precio: event.target.value,
                }))
              }
              placeholder="Precio"
              className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3 text-sm text-[var(--foreground)] outline-none"
            />
            <input
              required
              min="0"
              type="number"
              value={form.cantidad}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  cantidad: event.target.value,
                }))
              }
              placeholder="Cantidad disponible"
              className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3 text-sm text-[var(--foreground)] outline-none"
            />
          </div>

          <textarea
            value={form.descripcion}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                descripcion: event.target.value,
              }))
            }
            placeholder="Descripción del producto"
            rows={4}
            className="w-full rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3 text-sm text-[var(--foreground)] outline-none"
          />

          <label className="flex items-center gap-3 text-sm text-[var(--foreground)]">
            <input
              type="checkbox"
              checked={form.estado}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  estado: event.target.checked,
                }))
              }
            />
            Producto activo
          </label>

          <ProductImageUploader
            value={form.imagenes}
            onChange={(imagenes) =>
              setForm((current) => ({ ...current, imagenes }))
            }
          />

          {formError ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </p>
          ) : null}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-2xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isSaving ? "Guardando..." : editingProductId ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      ) : null}

      <DataTable
        headers={columns}
        data={products}
        isLoading={isLoading}
        rowKey="id"
        emptyMessage="No hay productos registrados para esta tienda."
        pagination={{
          page,
          totalPages,
          totalRecords,
          onPageChange: setPage,
        }}
      />
    </section>
  );
}
