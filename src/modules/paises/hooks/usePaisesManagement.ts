"use client";

import type { FormEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { useConfirmationDialog } from "@/modules/core/providers/ConfirmationDialogProvider";
import { useToast } from "@/modules/core/providers/ToastProvider";
import {
  createPais,
  fetchPaises,
  togglePaisEstado,
  updatePais,
} from "@/modules/paises/services/paises-service";
import type {
  Pais,
  PaisFormState,
  PaisStatusFilter,
} from "@/modules/paises/types/paises-types";

const FORM_ANIMATION_MS = 400;

const INITIAL_FORM: PaisFormState = {
  nombrePais: "",
  codigoPais: "",
  codigoTelefono: "",
  mascaraTelefono: "",
  monedaNombre: "",
  simboloMoneda: "",
  monedaCodigo: "",
  estado: true,
};

export function usePaisesManagement() {
  const { confirm } = useConfirmationDialog();
  const toast = useToast();

  const [paises, setPaises] = useState<Pais[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<PaisStatusFilter>("todos");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormMounted, setIsFormMounted] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingPaisId, setEditingPaisId] = useState<number | null>(null);
  const [form, setForm] = useState<PaisFormState>(INITIAL_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const closeFormTimeoutRef = useRef<number | null>(null);

  const clearCloseFormTimeout = useCallback(() => {
    if (closeFormTimeoutRef.current) {
      window.clearTimeout(closeFormTimeoutRef.current);
      closeFormTimeoutRef.current = null;
    }
  }, []);

  const resetForm = useCallback(() => {
    setEditingPaisId(null);
    setForm(INITIAL_FORM);
    setFormError(null);
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

  const loadPaises = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchPaises({
        page,
        pageSize,
        search,
        estadoFiltro: statusFilter,
      });

      setPaises(result.items);
      setTotalPages(result.totalPages);
      setTotalRecords(result.totalRecords);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudieron cargar los paises.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search, statusFilter]);

  useEffect(() => {
    void loadPaises();
  }, [loadPaises]);

  useEffect(() => {
    return () => {
      clearCloseFormTimeout();
    };
  }, [clearCloseFormTimeout]);

  const handleSearchChange = useCallback((value: string) => {
    setPage(1);
    setSearch(value);
  }, []);

  const handleStatusFilterChange = useCallback((value: PaisStatusFilter) => {
    setPage(1);
    setStatusFilter(value);
  }, []);

  const handleCreateClick = useCallback(() => {
    resetForm();
    openFormPanel();
  }, [openFormPanel, resetForm]);

  const handleEditClick = useCallback((pais: Pais) => {
    setEditingPaisId(pais.id);
    setForm({
      nombrePais: pais.nombrePais,
      codigoPais: pais.codigoPais,
      codigoTelefono: pais.codigoTelefono,
      mascaraTelefono: pais.mascaraTelefono,
      monedaNombre: pais.monedaNombre,
      simboloMoneda: pais.simboloMoneda,
      monedaCodigo: pais.monedaCodigo,
      estado: pais.estado,
    });
    setFormError(null);
    openFormPanel();
  }, [openFormPanel]);

  const validateForm = useCallback(() => {
    if (!form.nombrePais.trim()) {
      return "El nombre del pais es obligatorio.";
    }

    if (!form.codigoPais.trim()) {
      return "El codigo del pais es obligatorio.";
    }

    if (!form.codigoTelefono.trim()) {
      return "El codigo telefonico es obligatorio.";
    }

    if (!form.mascaraTelefono.trim()) {
      return "La mascara de telefono es obligatoria.";
    }

    if (!form.monedaNombre.trim()) {
      return "El nombre de la moneda es obligatorio.";
    }

    if (!form.simboloMoneda.trim()) {
      return "El simbolo de la moneda es obligatorio.";
    }

    if (!form.monedaCodigo.trim()) {
      return "El codigo de moneda es obligatorio.";
    }

    return null;
  }, [form]);

  const handleToggleStatus = useCallback(
    async (pais: Pais) => {
      const shouldContinue = await confirm({
        title: "Cambiar estado del pais",
        description: `El pais "${pais.nombrePais}" pasara a estado ${
          pais.estado ? "inactivo" : "activo"
        }.`,
        confirmLabel: pais.estado ? "Inactivar" : "Activar",
        variant: pais.estado ? "danger" : "primary",
      });

      if (!shouldContinue) {
        return;
      }

      try {
        await togglePaisEstado(pais.id);
        await loadPaises();
        toast.success(
          pais.estado
            ? "Pais inactivado correctamente."
            : "Pais activado correctamente.",
          "Pais",
        );
      } catch (toggleError) {
        setError(
          toggleError instanceof Error
            ? toggleError.message
            : "No se pudo cambiar el estado del pais.",
        );
      }
    },
    [confirm, loadPaises, toast],
  );

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setFormError(null);

      const validationError = validateForm();
      if (validationError) {
        setFormError(validationError);
        return;
      }

      setIsSaving(true);

      const payload = {
        nombrePais: form.nombrePais.trim(),
        codigoPais: form.codigoPais.trim(),
        codigoTelefono: form.codigoTelefono.trim(),
        mascaraTelefono: form.mascaraTelefono.trim(),
        monedaNombre: form.monedaNombre.trim(),
        simboloMoneda: form.simboloMoneda.trim(),
        monedaCodigo: form.monedaCodigo.trim(),
        estado: form.estado,
      };

      try {
        if (editingPaisId) {
          await updatePais(editingPaisId, payload);
          toast.success("Pais editado correctamente.", "Pais");
        } else {
          await createPais(payload);
          toast.success("Pais creado correctamente.", "Pais");
        }

        closeFormPanel(true);
        await loadPaises();
      } catch (saveError) {
        setFormError(
          saveError instanceof Error
            ? saveError.message
            : "No se pudo guardar el pais.",
        );
      } finally {
        setIsSaving(false);
      }
    },
    [closeFormPanel, editingPaisId, form, loadPaises, toast, validateForm],
  );

  return {
    paises,
    page,
    totalPages,
    totalRecords,
    search,
    statusFilter,
    isLoading,
    error,
    isFormMounted,
    isFormVisible,
    editingPaisId,
    form,
    formError,
    isSaving,
    onPageChange: setPage,
    onSearchChange: handleSearchChange,
    onStatusFilterChange: handleStatusFilterChange,
    onCreateClick: handleCreateClick,
    onEditClick: handleEditClick,
    onToggleStatus: handleToggleStatus,
    onCloseForm: () => closeFormPanel(true),
    onSubmit: handleSubmit,
    onNombrePaisChange: (value: string) =>
      setForm((current) => ({ ...current, nombrePais: value })),
    onCodigoPaisChange: (value: string) =>
      setForm((current) => ({ ...current, codigoPais: value })),
    onCodigoTelefonoChange: (value: string) =>
      setForm((current) => ({ ...current, codigoTelefono: value })),
    onMascaraTelefonoChange: (value: string) =>
      setForm((current) => ({ ...current, mascaraTelefono: value })),
    onMonedaNombreChange: (value: string) =>
      setForm((current) => ({ ...current, monedaNombre: value })),
    onSimboloMonedaChange: (value: string) =>
      setForm((current) => ({ ...current, simboloMoneda: value })),
    onMonedaCodigoChange: (value: string) =>
      setForm((current) => ({ ...current, monedaCodigo: value })),
    onEstadoChange: (value: boolean) =>
      setForm((current) => ({ ...current, estado: value })),
  };
}
