"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { CategoryDetailModal } from "@/modules/categories/components/CategoryDetailModal";
import { CategoryFormModal } from "@/modules/categories/components/CategoryFormModal";
import { CategoriesTable } from "@/modules/categories/components/CategoriesTable";
import { CategoriesToolbar } from "@/modules/categories/components/CategoriesToolbar";
import { PanelSectionHeader } from "@/modules/core/components/PanelSectionHeader";
import { useConfirmationDialog } from "@/modules/core/providers/ConfirmationDialogProvider";
import { useToast } from "@/modules/core/providers/ToastProvider";

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
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isFormMounted, setIsFormMounted] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const closeFormTimeoutRef = useRef<number | null>(null);
  const categoryDetailCloseTimeoutRef = useRef<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [isCategoryDetailOpen, setIsCategoryDetailOpen] = useState(false);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchCategories({
        storeId,
        page,
        pageSize,
        search,
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
  }, [page, pageSize, search, storeId]);

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

  const clearCategoryDetailCloseTimeout = useCallback(() => {
    if (categoryDetailCloseTimeoutRef.current) {
      window.clearTimeout(categoryDetailCloseTimeoutRef.current);
      categoryDetailCloseTimeoutRef.current = null;
    }
  }, []);

  const resetCategoryDetailState = useCallback(() => {
    setSelectedCategory(null);
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
      clearCategoryDetailCloseTimeout();
    };
  }, [clearCloseFormTimeout, clearCategoryDetailCloseTimeout]);

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

  const handleOpenCategoryDetail = useCallback((category: Category) => {
    clearCategoryDetailCloseTimeout();
    setSelectedCategory(category);
    setIsCategoryDetailOpen(true);
  }, [clearCategoryDetailCloseTimeout]);

  const handleCloseCategoryDetail = useCallback(() => {
    setIsCategoryDetailOpen(false);
    clearCategoryDetailCloseTimeout();
    categoryDetailCloseTimeoutRef.current = window.setTimeout(() => {
      resetCategoryDetailState();
    }, 240);
  }, [clearCategoryDetailCloseTimeout, resetCategoryDetailState]);

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

  return (
    <section className="space-y-5">
      <div className="app-card overflow-hidden rounded-2xl shadow-[0_12px_30px_rgba(15,23,42,0.07)]">
        <div className="space-y-3 px-4 py-4 md:px-5 md:py-5">
          <PanelSectionHeader
            title="Categorias"
            subtitle="Administra las categorias de productos de esta tienda."
            headingLevel="h2"
          />

          <CategoriesToolbar
            search={search}
            canManage={canManage}
            onSearchChange={(value) => {
              setPage(1);
              setSearch(value);
            }}
            onCreateClick={handleCreateClick}
          />
        </div>

        {error ? (
          <div className="border-t border-[var(--line)] px-4 py-3 md:px-5">
            <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
              {error}
            </p>
          </div>
        ) : null}

        <div className="px-0 pt-4">
          <CategoriesTable
            categories={categories}
            isLoading={isLoading}
            page={page}
            totalPages={totalPages}
            totalRecords={totalRecords}
            canManage={canManage}
            onPageChange={setPage}
            onDetails={handleOpenCategoryDetail}
            onEdit={handleEditClick}
            onToggleStatus={handleToggleStatus}
          />
        </div>
      </div>

      <CategoryFormModal
        isMounted={isFormMounted}
        isVisible={isFormVisible}
        editingCategoryId={editingCategoryId}
        form={form}
        isSaving={isSaving}
        formError={formError}
        onClose={() => closeFormPanel(true)}
        onSubmit={handleSubmit}
        onNombreChange={(value) =>
          setForm((current) => ({ ...current, nombre: value }))
        }
      />

      <CategoryDetailModal
        open={isCategoryDetailOpen}
        category={selectedCategory}
        onClose={handleCloseCategoryDetail}
      />
    </section>
  );
}
