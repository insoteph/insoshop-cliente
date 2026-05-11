"use client";

import type { FormEvent } from "react";

import { MaterialInput } from "@/modules/core/components/MaterialInput";
import type { PaisFormState } from "@/modules/paises/types/paises-types";

type PaisFormPanelProps = {
  isMounted: boolean;
  isVisible: boolean;
  editingPaisId: number | null;
  form: PaisFormState;
  isSaving: boolean;
  formError: string | null;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onNombrePaisChange: (value: string) => void;
  onCodigoPaisChange: (value: string) => void;
  onCodigoTelefonoChange: (value: string) => void;
  onMascaraTelefonoChange: (value: string) => void;
  onMonedaNombreChange: (value: string) => void;
  onSimboloMonedaChange: (value: string) => void;
  onMonedaCodigoChange: (value: string) => void;
  onEstadoChange: (value: boolean) => void;
};

export function PaisFormPanel({
  isMounted,
  isVisible,
  editingPaisId,
  form,
  isSaving,
  formError,
  onClose,
  onSubmit,
  onNombrePaisChange,
  onCodigoPaisChange,
  onCodigoTelefonoChange,
  onMascaraTelefonoChange,
  onMonedaNombreChange,
  onSimboloMonedaChange,
  onMonedaCodigoChange,
  onEstadoChange,
}: PaisFormPanelProps) {
  if (!isMounted) {
    return null;
  }

  return (
    <div
      className={`origin-top overflow-hidden transition-all duration-500 ease-in-out ${
        isVisible
          ? "max-h-[1800px] translate-y-0 opacity-100"
          : "pointer-events-none max-h-0 -translate-y-2 opacity-0"
      }`}
    >
      <form
        className="space-y-5 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 shadow-md"
        onSubmit={onSubmit}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="text-lg font-semibold text-[var(--foreground-strong)]">
              {editingPaisId ? "Editar pais" : "Crear pais"}
            </h4>
            <p className="text-sm text-[var(--muted)]">
              Mantiene el codigo telefonico, mascara y moneda asociada.
            </p>
          </div>

          <button
            type="button"
            className="app-button-secondary rounded-xl px-3 py-2 text-sm"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <MaterialInput
            id="pais-nombre"
            label="Nombre del pais"
            value={form.nombrePais}
            onChange={(event) => onNombrePaisChange(event.target.value)}
            required
          />
          <MaterialInput
            id="pais-codigo"
            label="Codigo del pais"
            value={form.codigoPais}
            onChange={(event) => onCodigoPaisChange(event.target.value)}
            placeholder="HN"
            required
          />
          <MaterialInput
            id="pais-codigo-telefono"
            label="Codigo telefonico"
            value={form.codigoTelefono}
            onChange={(event) => onCodigoTelefonoChange(event.target.value)}
            placeholder="+504"
            required
          />
          <MaterialInput
            id="pais-mascara"
            label="Mascara de telefono"
            value={form.mascaraTelefono}
            onChange={(event) => onMascaraTelefonoChange(event.target.value)}
            placeholder="####-####"
            required
          />
          <MaterialInput
            id="pais-moneda-nombre"
            label="Moneda nombre"
            value={form.monedaNombre}
            onChange={(event) => onMonedaNombreChange(event.target.value)}
            required
          />
          <MaterialInput
            id="pais-moneda-simbolo"
            label="Simbolo moneda"
            value={form.simboloMoneda}
            onChange={(event) => onSimboloMonedaChange(event.target.value)}
            required
          />
          <MaterialInput
            id="pais-moneda-codigo"
            label="Codigo moneda"
            value={form.monedaCodigo}
            onChange={(event) => onMonedaCodigoChange(event.target.value)}
            placeholder="HNL"
            required
          />

          <label className="app-card-muted flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-[var(--foreground)]">
            <input
              type="checkbox"
              checked={form.estado}
              onChange={(event) => onEstadoChange(event.target.checked)}
            />
            Pais activo
          </label>
        </div>

        {formError ? (
          <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
            {formError}
          </p>
        ) : null}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="app-button-primary rounded-lg px-4 py-3 text-sm font-semibold disabled:opacity-60"
          >
            {isSaving ? "Guardando..." : "Guardar pais"}
          </button>
        </div>
      </form>
    </div>
  );
}
