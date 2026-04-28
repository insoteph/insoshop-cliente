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
import { useConfirmationDialog } from "@/modules/core/providers/ConfirmationDialogProvider";
import { useToast } from "@/modules/core/providers/ToastProvider";
import { SearchBar } from "@/modules/core/components/SearchBar";

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
const FORM_ANIMATION_MS = 400;

export function CategoriesPanel({
  storeId,
  canManage,
}: CategoriesPanelProps) {
  const { confirm } = useConfirmationDialog();
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
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
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const closeFormTimeoutRef = useRef<number | null>(null);

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
          : "No se pudieron cargar las categorias.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search, statusFilter, storeId]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const resetForm = useCallback(() => {
    setForm(INITIAL_FORM);
    setEditingCategoryId(null);
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
        toast.success("Categoria editada correctamente.", "Categoria");
      } else {
        await createCategory(storeId, payload);
        toast.success("Categoria creada correctamente.", "Categoria");
      }

      closeFormPanel(true);
      await loadCategories();
    } catch (saveError) {
      setFormError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo guardar la categoria.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  const handleCreateClick = useCallback(() => {
    resetForm();
    openFormPanel();
  }, [openFormPanel, resetForm]);

  const handleEditClick = useCallback((category: Category) => {
    setEditingCategoryId(category.id);
    setForm({
      nombre: category.nombre,
      estado: category.estado,
    });
    setFormError(null);
    openFormPanel();
  }, [openFormPanel]);

  const handleToggleStatus = useCallback(
    async (category: Category) => {
      const action = category.estado ? "inactivar" : "activar";
      const shouldContinue = await confirm({
        title: "Confirmar accion",
        description: `Deseas ${action} esta categoria?`,
        confirmLabel: category.estado ? "Inactivar" : "Activar",
        variant: category.estado ? "danger" : "primary",
      });
      if (!shouldContinue) {
        return;
      }

      try {
        await toggleCategoryStatus(category.id, storeId);
        await loadCategories();
        toast.success(
          category.estado
            ? "Categoria inactivada correctamente."
            : "Categoria activada correctamente.",
          "Categoria",
        );
      } catch (toggleError) {
        setError(
          toggleError instanceof Error
            ? toggleError.message
            : "No se pudo actualizar el estado de la categoria.",
        );
      }
    },
    [confirm, loadCategories, storeId, toast],
  );

  const columns = useMemo<DataTableColumn<Category>[]>(
    () => [
      {
        key: "nombre",
        header: "Categoria",
        className: "font-semibold",
      },
      {
        key: "estado",
        header: "Estado",
      },
    ],
    [],
  );

  const stateBadges = useMemo<Array<DataTableBadgeConfig<Category>>>(
    () => [
      {
        columnKey: "estado",
        rules: [
          {
            value: true,
            label: "Activa",
            iconPath: "/icons/check.svg",
            textClassName: "app-badge-success",
            backgroundClassName: "",
          },
          {
            value: false,
            label: "Inactiva",
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
        primaryButtonLabel: "Editar",
        onPrimaryAction: handleEditClick,
        dropdownOptions: [
          {
            label: (category: Category) =>
              category.estado ? "Inactivar" : "Activar",
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
              label: "Nueva categoria",
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
              placeholder="Buscar por nombre de categoria"
              ariaLabel="Buscar categorias"
            />
          </div>
          <ToolbarActions actions={toolbarActions} className="md:shrink-0" />
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
            <option value="activos">Solo activas</option>
            <option value="inactivos">Solo inactivas</option>
          </select>
        </div>

        {error ? (
          <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
            {error}
          </p>
        ) : null}
      </div>

      {isFormMounted ? (
        <div
          className={`origin-top overflow-hidden transition-all duration-500 ease-in-out ${
            isFormVisible
              ? "max-h-[900px] translate-y-0 opacity-100"
              : "pointer-events-none max-h-0 -translate-y-2 opacity-0"
          }`}
        >
          <form
            className="space-y-4 rounded-md border border-[var(--line)] bg-[var(--panel)] p-5 shadow-md"
            onSubmit={handleSubmit}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-lg font-semibold text-[var(--foreground)]">
                  {editingCategoryId ? "Editar categoria" : "Crear categoria"}
                </h4>
                <p className="text-sm text-[var(--muted)]">
                  Manten consistencia en nombres y estado de publicacion.
                </p>
              </div>
              <button
                type="button"
                className="app-button-secondary rounded-xl px-3 py-2 text-sm"
                onClick={() => closeFormPanel(true)}
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
              placeholder="Nombre de la categoria"
              className="app-input rounded-2xl px-4 py-3 text-sm"
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
              Categoria activa
            </label>

            {formError ? (
              <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
                {formError}
              </p>
            ) : null}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="app-button-primary rounded-2xl px-4 py-3 text-sm font-semibold disabled:opacity-60"
              >
                {isSaving ? "Guardando..." : editingCategoryId ? "Actualizar" : "Crear"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="app-card rounded-2xl py-2">
        <DataTableToolbar
          pageSize={pageSize}
          onPageSizeChange={(value) => {
            setPage(1);
            setPageSize(value);
          }}
        />
        <div className="app-divider mb-2 mt-1 border-b" />
        <div className="px-3">
          <DataTable
            headers={columns}
            data={categories}
            isLoading={isLoading}
            rowKey="id"
            emptyMessage="No hay categorias registradas para esta tienda."
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
