"use client";

import { MaterialInput } from "@/modules/core/components/MaterialInput";

export type StoreCreateFormState = {
  nombre: string;
  codigoPais: string;
  numeroTelefono: string;
  moneda: string;
  logoUrl: string;
  estado: boolean;
};

type StoreCreateFormPanelProps = {
  isVisible: boolean;
  form: StoreCreateFormState;
  isSaving: boolean;
  formError: string | null;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
  onNombreChange: (value: string) => void;
  onCodigoPaisChange: (value: string) => void;
  onNumeroTelefonoChange: (value: string) => void;
  onMonedaChange: (value: string) => void;
  onLogoUrlChange: (value: string) => void;
  onEstadoChange: (value: boolean) => void;
};

const COUNTRY_CODE_OPTIONS = [
  "+504",
  "+503",
  "+502",
  "+52",
  "+57",
  "+58",
  "+1",
  "+34",
];

export function StoreCreateFormPanel({
  isVisible,
  form,
  isSaving,
  formError,
  onSubmit,
  onClose,
  onNombreChange,
  onCodigoPaisChange,
  onNumeroTelefonoChange,
  onMonedaChange,
  onLogoUrlChange,
  onEstadoChange,
}: StoreCreateFormPanelProps) {
  return (
    <div
      className={`origin-top overflow-hidden transition-all duration-500 ease-in-out ${
        isVisible
          ? "max-h-[1200px] translate-y-0 opacity-100"
          : "pointer-events-none max-h-0 -translate-y-2 opacity-0"
      }`}
    >
      <form
        className="space-y-4 rounded-md border border-[var(--line)] bg-[var(--panel)] p-5 shadow-md"
        onSubmit={onSubmit}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="text-lg font-semibold text-[var(--foreground-strong)]">
              Crear tienda
            </h4>
            <p className="text-sm text-[var(--muted)]">
              Registra una nueva tienda y define sus datos principales.
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

        <MaterialInput
          id="store-create-nombre"
          label="Nombre de la tienda"
          value={form.nombre}
          onChange={(event) => onNombreChange(event.target.value)}
          required
        />

        <div className="grid gap-4 md:grid-cols-[170px_minmax(0,1fr)]">
          <div className="relative">
            <select
              value={form.codigoPais}
              onChange={(event) => onCodigoPaisChange(event.target.value)}
              className="app-input h-11 w-full rounded-xl px-3 pt-3 text-sm"
              aria-label="Codigo de pais"
            >
              {COUNTRY_CODE_OPTIONS.map((countryCode) => (
                <option key={countryCode} value={countryCode}>
                  {countryCode}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute left-2 top-0 -translate-y-1/2 bg-[var(--panel-strong)] px-1 text-[11px] font-medium text-[var(--accent)]">
              Codigo de pais
            </span>
          </div>

          <MaterialInput
            id="store-create-numero-telefono"
            label="Numero telefonico"
            type="tel"
            value={form.numeroTelefono}
            onChange={(event) => onNumeroTelefonoChange(event.target.value)}
            required
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <MaterialInput
            id="store-create-moneda"
            label="Moneda"
            value={form.moneda}
            onChange={(event) => onMonedaChange(event.target.value)}
            required
          />

          <label className="app-card-muted flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-[var(--foreground)]">
            <input
              type="checkbox"
              checked={form.estado}
              onChange={(event) => onEstadoChange(event.target.checked)}
            />
            Tienda activa
          </label>
        </div>

        <MaterialInput
          id="store-create-logo-url"
          label="URL del logo"
          value={form.logoUrl}
          onChange={(event) => onLogoUrlChange(event.target.value)}
          required
        />

        {formError ? (
          <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
            {formError}
          </p>
        ) : null}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="app-button-primary rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-60"
          >
            {isSaving ? "Guardando..." : "Crear tienda"}
          </button>
        </div>
      </form>
    </div>
  );
}
