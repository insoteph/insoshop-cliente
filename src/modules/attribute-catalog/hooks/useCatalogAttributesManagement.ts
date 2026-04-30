"use client";

import type { FormEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  createCatalogAttribute,
  fetchCatalogAttributeById,
  fetchCatalogAttributes,
  toggleCatalogAttributeStatus,
  updateCatalogAttribute,
  type CatalogAttribute,
} from "@/modules/attribute-catalog/services/attribute-catalog-service";
import { useCatalogAttributeForm } from "@/modules/attribute-catalog/hooks/useCatalogAttributeForm";
import type { CatalogAttributeStatusFilter } from "@/modules/attribute-catalog/types/catalog-attribute-form.types";
import { useConfirmationDialog } from "@/modules/core/providers/ConfirmationDialogProvider";
import { useToast } from "@/modules/core/providers/ToastProvider";

const FORM_ANIMATION_MS = 400;

export function useCatalogAttributesManagement() {
  const { confirm } = useConfirmationDialog();
  const toast = useToast();
  const form = useCatalogAttributeForm();

  const [attributes, setAttributes] = useState<CatalogAttribute[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<CatalogAttributeStatusFilter>("todos");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormMounted, setIsFormMounted] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingAttributeId, setEditingAttributeId] = useState<number | null>(
    null,
  );
  const closeFormTimeoutRef = useRef<number | null>(null);

  const clearCloseFormTimeout = useCallback(() => {
    if (closeFormTimeoutRef.current) {
      window.clearTimeout(closeFormTimeoutRef.current);
      closeFormTimeoutRef.current = null;
    }
  }, []);

  const resetFormState = useCallback(() => {
    setEditingAttributeId(null);
    form.resetForm();
  }, [form]);

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
          resetFormState();
        }
      }, FORM_ANIMATION_MS);
    },
    [clearCloseFormTimeout, resetFormState],
  );

  const loadAttributes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchCatalogAttributes({
        page,
        pageSize,
        search,
        estadoFiltro: statusFilter,
      });

      setAttributes(result.items);
      setTotalPages(result.totalPages);
      setTotalRecords(result.totalRecords);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudieron cargar los atributos de catálogo.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search, statusFilter]);

  useEffect(() => {
    void loadAttributes();
  }, [loadAttributes]);

  useEffect(() => {
    return () => {
      clearCloseFormTimeout();
    };
  }, [clearCloseFormTimeout]);

  const handleSearchChange = useCallback((value: string) => {
    setPage(1);
    setSearch(value);
  }, []);

  const handleStatusFilterChange = useCallback(
    (value: CatalogAttributeStatusFilter) => {
      setPage(1);
      setStatusFilter(value);
    },
    [],
  );

  const handleCreateClick = useCallback(() => {
    resetFormState();
    openFormPanel();
  }, [openFormPanel, resetFormState]);

  const handleEditClick = useCallback(
    async (attribute: CatalogAttribute) => {
      try {
        const detail = await fetchCatalogAttributeById(attribute.id);
        setEditingAttributeId(detail.id);
        form.setFormFromDetail(detail);
        openFormPanel();
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudo cargar el detalle del atributo.",
        );
      }
    },
    [form, openFormPanel],
  );

  const handleToggleStatus = useCallback(
    async (attribute: CatalogAttribute) => {
      const shouldContinue = await confirm({
        title: "Cambiar estado del atributo",
        description: `El atributo "${attribute.nombre}" pasará a estado ${
          attribute.estado ? "inactivo" : "activo"
        }.`,
        confirmLabel: attribute.estado ? "Inactivar" : "Activar",
        variant: attribute.estado ? "danger" : "primary",
      });

      if (!shouldContinue) {
        return;
      }

      try {
        await toggleCatalogAttributeStatus(attribute.id);
        await loadAttributes();
        toast.success(
          attribute.estado
            ? "Atributo inactivado correctamente."
            : "Atributo activado correctamente.",
          "Atributo",
        );
      } catch (toggleError) {
        setError(
          toggleError instanceof Error
            ? toggleError.message
            : "No se pudo cambiar el estado del atributo.",
        );
      }
    },
    [confirm, loadAttributes, toast],
  );

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      form.setFormError(null);

      const validationError = form.validateForm();
      if (validationError) {
        form.setFormError(validationError);
        return;
      }

      form.setIsSaving(true);

      try {
        const payload = form.buildPayload();

        if (editingAttributeId) {
          await updateCatalogAttribute(editingAttributeId, payload);
          toast.success("Atributo editado correctamente.", "Atributo");
        } else {
          await createCatalogAttribute(payload);
          toast.success("Atributo creado correctamente.", "Atributo");
        }

        closeFormPanel(true);
        await loadAttributes();
      } catch (saveError) {
        form.setFormError(
          saveError instanceof Error
            ? saveError.message
            : "No se pudo guardar el atributo de catálogo.",
        );
      } finally {
        form.setIsSaving(false);
      }
    },
    [closeFormPanel, editingAttributeId, form, loadAttributes, toast],
  );

  return {
    attributes,
    page,
    totalPages,
    totalRecords,
    search,
    statusFilter,
    isLoading,
    error,
    isFormMounted,
    isFormVisible,
    editingAttributeId,
    form: form.form,
    formError: form.formError,
    isSaving: form.isSaving,
    onPageChange: setPage,
    onSearchChange: handleSearchChange,
    onStatusFilterChange: handleStatusFilterChange,
    onCreateClick: handleCreateClick,
    onEditClick: handleEditClick,
    onToggleStatus: handleToggleStatus,
    onCloseForm: () => closeFormPanel(true),
    onSubmit: handleSubmit,
    onNombreChange: form.setNombre,
    onEstadoChange: form.setEstado,
    onValueTextChange: form.setValueText,
    onValueColorChange: form.setValueColor,
    onValueUsesColorChange: form.setValueUsesColor,
    onValueOrderChange: form.setValueOrder,
    onAddValue: form.addValue,
    onRemoveValue: form.removeValue,
  };
}
