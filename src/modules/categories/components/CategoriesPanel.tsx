"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { DataTable } from "@/modules/core/components/DataTable";

import {
  createCategory,
  fetchCategories,
  toggleCategoryStatus,
  updateCategory,
  type Category,
} from "@/modules/categories/services/category-service";

type CategoriesPanelProps = {
  storeId: number;
  canManage: boolean;
};

const INITIAL_FORM = {
  nombre: "",
  estado: true,
};

export function CategoriesPanel({
  storeId,
  canManage,
}: CategoriesPanelProps) {
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
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchCategories({
        storeId,
        page,
        pageSize,
        search,
        estadoFiltro: statusFilter,
      });

      setCategories(result.items);
      setTotalPages(result.totalPages);
      setTotalRecords(result.totalRecords);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudieron cargar las categorías."
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search, statusFilter, storeId]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  function resetForm() {
    setForm(INITIAL_FORM);
    setEditingCategoryId(null);
    setFormError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setFormError(null);

    try {
      const payload = {
        nombre: form.nombre.trim(),
        estado: form.estado,
      };

      if (editingCategoryId) {
        await updateCategory(editingCategoryId, storeId, payload);
      } else {
        await createCategory(storeId, payload);
      }

      resetForm();
      setShowForm(false);
      await loadCategories();
    } catch (saveError) {
      setFormError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo guardar la categoría."
      );
    } finally {
      setIsSaving(false);
    }
  }

  const handleToggleStatus = useCallback(async (category: Category) => {
    const action = category.estado ? "desactivar" : "activar";
    if (!window.confirm(`¿Deseas ${action} esta categoría?`)) {
      return;
    }

    try {
      await toggleCategoryStatus(category.id, storeId);
      await loadCategories();
    } catch (toggleError) {
      setError(
        toggleError instanceof Error
          ? toggleError.message
          : "No se pudo actualizar el estado de la categoría."
      );
    }
  }, [loadCategories, storeId]);

  const columns = useMemo(
    () => [
      {
        key: "nombre",
        header: "Categoría",
        render: (category: Category) => (
          <span className="font-semibold text-[var(--foreground)]">
            {category.nombre}
          </span>
        ),
      },
      {
        key: "estado",
        header: "Estado",
        render: (category: Category) => (
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
              category.estado
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-200 text-slate-700"
            }`}
          >
            {category.estado ? "Activa" : "Inactiva"}
          </span>
        ),
      },
      {
        key: "acciones",
        header: "Acciones",
        render: (category: Category) => (
          <div className="flex flex-wrap gap-2">
            {canManage ? (
              <>
                <button
                  type="button"
                  className="rounded-xl border border-[var(--line)] px-3 py-2 text-xs font-semibold text-[var(--foreground)]"
                  onClick={() => {
                    setEditingCategoryId(category.id);
                    setForm({
                      nombre: category.nombre,
                      estado: category.estado,
                    });
                    setFormError(null);
                    setShowForm(true);
                  }}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-[var(--line)] px-3 py-2 text-xs font-semibold text-[var(--foreground)]"
                  onClick={() => handleToggleStatus(category)}
                >
                  {category.estado ? "Inactivar" : "Activar"}
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
    [canManage, handleToggleStatus]
  );

  return (
    <section className="space-y-5">
      <div className="space-y-4 rounded-md border border-[var(--line)] bg-[var(--panel)] p-5 shadow-lg">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[var(--foreground)]">
              Categorías de la tienda
            </h3>
            <p className="text-sm text-[var(--muted)]">
              Organiza el catálogo y define qué categorías están disponibles.
            </p>
          </div>

          {canManage ? (
            <button
              type="button"
              className="rounded-2xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white"
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
            >
              Nueva categoría
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
            placeholder="Buscar categorías"
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
            <option value="activos">Solo activas</option>
            <option value="inactivos">Solo inactivas</option>
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
                {editingCategoryId ? "Editar categoría" : "Crear categoría"}
              </h4>
              <p className="text-sm text-[var(--muted)]">
                Mantén consistencia en nombres y estado de publicación.
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

          <input
            required
            value={form.nombre}
            onChange={(event) =>
              setForm((current) => ({ ...current, nombre: event.target.value }))
            }
            placeholder="Nombre de la categoría"
            className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3 text-sm text-[var(--foreground)] outline-none"
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
            Categoría activa
          </label>

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
              {isSaving ? "Guardando..." : editingCategoryId ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      ) : null}

      <DataTable
        headers={columns}
        data={categories}
        isLoading={isLoading}
        rowKey="id"
        emptyMessage="No hay categorías registradas para esta tienda."
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


