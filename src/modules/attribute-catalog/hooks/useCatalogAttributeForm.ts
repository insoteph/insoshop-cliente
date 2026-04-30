"use client";

import { useCallback, useState } from "react";

import {
  createEmptyCatalogAttributeFormValue,
  createInitialCatalogAttributeFormState,
  mapCatalogAttributeDetailToFormState,
  mapCatalogAttributeFormToPayload,
} from "@/modules/attribute-catalog/mappers/catalog-attribute-form.mapper";
import type { CatalogAttributeDetail } from "@/modules/attribute-catalog/services/attribute-catalog-service";
import type { CatalogAttributeFormValue } from "@/modules/attribute-catalog/types/catalog-attribute-form.types";

export function useCatalogAttributeForm() {
  const [form, setForm] = useState(createInitialCatalogAttributeFormState);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const resetForm = useCallback(() => {
    setForm(createInitialCatalogAttributeFormState());
    setFormError(null);
  }, []);

  const setFormFromDetail = useCallback((detail: CatalogAttributeDetail) => {
    setForm(mapCatalogAttributeDetailToFormState(detail));
    setFormError(null);
  }, []);

  const setNombre = useCallback((nombre: string) => {
    setForm((current) => ({
      ...current,
      nombre,
    }));
  }, []);

  const setEstado = useCallback((estado: boolean) => {
    setForm((current) => ({
      ...current,
      estado,
    }));
  }, []);

  const updateValue = useCallback(
    (
      valueId: string,
      updater: (value: CatalogAttributeFormValue) => CatalogAttributeFormValue,
    ) => {
      setForm((current) => ({
        ...current,
        valores: current.valores.map((value) =>
          value.id === valueId ? updater(value) : value,
        ),
      }));
    },
    [],
  );

  const setValueText = useCallback(
    (valueId: string, valor: string) => {
      updateValue(valueId, (current) => ({
        ...current,
        valor,
      }));
    },
    [updateValue],
  );

  const setValueColor = useCallback(
    (valueId: string, colorHexadecimal: string) => {
      updateValue(valueId, (current) => ({
        ...current,
        colorHexadecimal: colorHexadecimal.trim().toUpperCase(),
      }));
    },
    [updateValue],
  );

  const setValueUsesColor = useCallback(
    (valueId: string, usaColor: boolean) => {
      updateValue(valueId, (current) => ({
        ...current,
        usaColor,
        colorHexadecimal: usaColor ? current.colorHexadecimal : "#000000",
      }));
    },
    [updateValue],
  );

  const setValueOrder = useCallback(
    (valueId: string, orden: string) => {
      updateValue(valueId, (current) => ({
        ...current,
        orden,
      }));
    },
    [updateValue],
  );

  const addValue = useCallback(() => {
    setForm((current) => ({
      ...current,
      valores: [
        ...current.valores,
        createEmptyCatalogAttributeFormValue(current.valores.length + 1),
      ],
    }));
  }, []);

  const removeValue = useCallback((valueId: string) => {
    setForm((current) => ({
      ...current,
      valores:
        current.valores.length > 1
          ? current.valores.filter((value) => value.id !== valueId)
          : current.valores,
    }));
  }, []);

  const validateForm = useCallback(() => {
    if (!form.nombre.trim()) {
      return "El nombre del atributo es obligatorio.";
    }

    const hasAtLeastOneValue = form.valores.some(
      (value) => value.valor.trim().length > 0,
    );

    if (!hasAtLeastOneValue) {
      return "Debes agregar al menos un valor para el atributo.";
    }

    return null;
  }, [form]);

  const buildPayload = useCallback(() => mapCatalogAttributeFormToPayload(form), [form]);

  return {
    form,
    formError,
    isSaving,
    setFormError,
    setIsSaving,
    resetForm,
    setFormFromDetail,
    setNombre,
    setEstado,
    setValueText,
    setValueColor,
    setValueUsesColor,
    setValueOrder,
    addValue,
    removeValue,
    validateForm,
    buildPayload,
  };
}
