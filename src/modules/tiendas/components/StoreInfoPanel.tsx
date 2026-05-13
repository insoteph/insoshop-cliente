"use client";

import { useCallback, useEffect, useState } from "react";

import { AppButton } from "@/modules/core/components/AppButton";
import { PanelSectionHeader } from "@/modules/core/components/PanelSectionHeader";
import { useToast } from "@/modules/core/providers/ToastProvider";
import {
  fetchTiendaById,
  fetchPaises,
  updateTienda,
} from "@/modules/tiendas/services/tiendas-service";
import type {
  PaisTelefono,
  TiendaDetalle,
} from "@/modules/tiendas/types/tiendas-types";

type StoreInfoPanelProps = {
  storeId: number;
  canEdit: boolean;
};

type StoreFormState = {
  nombre: string;
  telefono: string;
  codigoPais: string;
  estado: boolean;
};

const INITIAL_FORM: StoreFormState = {
  nombre: "",
  telefono: "",
  codigoPais: "",
  estado: true,
};

export function StoreInfoPanel({ storeId, canEdit }: StoreInfoPanelProps) {
  const toast = useToast();
  const [store, setStore] = useState<TiendaDetalle | null>(null);
  const [form, setForm] = useState<StoreFormState>(INITIAL_FORM);
  const [availablePaises, setAvailablePaises] = useState<PaisTelefono[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStore = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchTiendaById(storeId);
      setStore(result);

      try {
        const paises = await fetchPaises();
        setAvailablePaises(paises);
        const defaultCountry =
          paises.find((country) => country.estado) ?? paises[0];
        const resolvedCountry =
          paises.find((country) => country.codigoPais === result.codigoPais) ??
          paises.find(
            (country) => country.codigoTelefono === result.telefonoCodigoPais,
          ) ??
          paises.find((country) => country.nombrePais === result.pais) ??
          defaultCountry;

        setForm({
          nombre: result.nombre,
          telefono: result.telefono,
          codigoPais: resolvedCountry?.codigoPais || "",
          estado: result.estado,
        });
      } catch {
        setAvailablePaises([]);
        setForm({
          nombre: result.nombre,
          telefono: result.telefono,
          codigoPais: result.codigoPais,
          estado: result.estado,
        });
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudo cargar la tienda.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    void loadStore();
  }, [loadStore]);

  const selectedCountry = availablePaises.find(
    (country) => country.codigoPais === form.codigoPais,
  );
  const phoneCode = selectedCountry?.codigoTelefono || store?.telefonoCodigoPais || "";
  const phoneMask = selectedCountry?.mascaraTelefono || store?.mascaraTelefono || "";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      await updateTienda(storeId, form);
      await loadStore();
      setIsEditing(false);
      toast.success("Tienda editada correctamente.", "Tienda");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo actualizar la tienda.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <section className="panel-card">
        <p className="text-sm text-[var(--muted)]">Cargando informacion...</p>
      </section>
    );
  }

  if (error && !store) {
    return (
      <section>
        <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
          {error}
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="app-card overflow-hidden rounded-2xl shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
        <div className="px-5 py-4 sm:px-6 sm:py-5">
          <PanelSectionHeader
            title="Informacion de la tienda"
            subtitle="Actualiza los datos principales de tu tienda"
            headingLevel="h2"
          />
        </div>

        <div className="border-t border-[var(--line)]" />

        <div className="p-5 sm:p-6">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <select
                  id="store-pais"
                  value={form.codigoPais}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      codigoPais: event.target.value,
                      telefono: "",
                    }))
                  }
                  disabled={!canEdit || !isEditing}
                  className="app-input h-12 w-full rounded-xl px-3 pt-3 text-sm disabled:opacity-70"
                >
                  <option value="" disabled>
                    Selecciona un pais
                  </option>
                  {availablePaises
                    .filter((country) => country.estado)
                    .map((country) => (
                      <option key={country.id} value={country.codigoPais}>
                        {country.nombrePais}
                      </option>
                    ))}
                </select>
                <label
                  htmlFor="store-pais"
                  className="pointer-events-none absolute left-2 top-0 -translate-y-1/2 bg-[var(--panel)] px-1 text-[11px] font-medium text-[var(--accent)]"
                >
                  Pais
                </label>
              </div>

              <div className="relative">
                <input
                  id="store-moneda"
                  type="text"
                  value={
                    selectedCountry
                      ? `${selectedCountry.monedaNombre} (${selectedCountry.simboloMoneda})`
                      : "-"
                  }
                  readOnly
                  className="app-input h-12 w-full rounded-xl px-3 pt-3 text-sm text-[var(--foreground-strong)] opacity-90"
                />
                <label
                  htmlFor="store-moneda"
                  className="pointer-events-none absolute left-2 top-0 -translate-y-1/2 bg-[var(--panel)] px-1 text-[11px] font-medium text-[var(--accent)]"
                >
                  Moneda
                </label>
              </div>

              <div className="col-span-2 grid grid-cols-2 gap-3 items-end">
                <div className="relative">
                  <input
                    id="store-codigo-telefono"
                    type="text"
                    value={phoneCode}
                    readOnly
                    className="app-input h-12 w-full rounded-xl px-3 pt-3 text-sm text-[var(--foreground-strong)] opacity-90"
                  />
                  <label
                    htmlFor="store-codigo-telefono"
                    className="pointer-events-none absolute left-2 top-0 -translate-y-1/2 bg-[var(--panel)] px-1 text-[11px] font-medium text-[var(--accent)]"
                  >
                    Codigo de telefono
                  </label>
                </div>

                <div className="relative">
                  <input
                    id="store-telefono"
                    type="tel"
                    value={form.telefono}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        telefono: event.target.value,
                      }))
                    }
                    disabled={!canEdit || !isEditing}
                    placeholder={phoneMask || "Numero telefonico"}
                    className="app-input h-12 w-full rounded-xl px-3 pt-3 text-sm disabled:opacity-70"
                  />
                  <label
                    htmlFor="store-telefono"
                    className="pointer-events-none absolute left-2 top-0 -translate-y-1/2 bg-[var(--panel)] px-1 text-[11px] font-medium text-[var(--accent)]"
                  >
                    Numero telefonico
                  </label>
                </div>
              </div>
            </div>

            {error ? (
              <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
                {error}
              </p>
            ) : null}

            <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div />

              <div className="flex flex-wrap items-center gap-3">
                {canEdit ? (
                  <AppButton
                    variant={isEditing ? "cancel" : "primary"}
                    iconPath={isEditing ? "/icons/cross.svg" : "/icons/edit.svg"}
                    onClick={() =>
                      setIsEditing((currentValue) => !currentValue)
                    }
                    disabled={isSaving}
                  >
                    {isEditing ? "Cancelar" : "Editar Informacion"}
                  </AppButton>
                ) : null}

                {canEdit ? (
                  <AppButton
                    iconPath="/icons/save.svg"
                    type="submit"
                    variant="primary"
                    disabled={isSaving || !isEditing}
                  >
                    {isSaving ? "Guardando..." : "Guardar cambios"}
                  </AppButton>
                ) : null}
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
