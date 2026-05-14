"use client";

import type { FormEvent } from "react";

import { AppButton } from "@/modules/core/components/AppButton";

type CategoryFormState = {
  nombre: string;
  estado: boolean;
};

type CategoryFormPanelProps = {
  editingCategoryId: number | null;
  form: CategoryFormState;
  isSaving: boolean;
  formError: string | null;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onNombreChange: (value: string) => void;
};

export function CategoryFormPanel({
  editingCategoryId,
  form,
  isSaving,
  formError,
  onClose,
  onSubmit,
  onNombreChange,
}: CategoryFormPanelProps) {
  return (
    <form className="space-y-4 px-5 py-5" onSubmit={onSubmit}>
      <input
        required
        value={form.nombre}
        onChange={(event) => onNombreChange(event.target.value)}
        placeholder="Nombre de la categoria"
        className="app-input rounded-2xl px-4 py-3 text-sm"
      />

      {formError ? (
        <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
          {formError}
        </p>
      ) : null}

      <div className="flex justify-end gap-2">
        <AppButton
          variant="cancel"
          iconPath="/icons/cross.svg"
          onClick={onClose}
        >
          Cancelar
        </AppButton>
        <AppButton iconPath="/icons/save.svg" type="submit" disabled={isSaving}>
          {isSaving
            ? "Guardando..."
            : editingCategoryId
              ? "Actualizar"
              : "Crear"}
        </AppButton>
      </div>
    </form>
  );
}
