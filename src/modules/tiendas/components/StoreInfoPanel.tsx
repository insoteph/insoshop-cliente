"use client";

import { useEffect, useState } from "react";

import { MaterialInput } from "@/modules/core/components/MaterialInput";
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
  logoUrl: string;
  estado: boolean;
};

const INITIAL_FORM: StoreFormState = {
  nombre: "",
  telefono: "",
  codigoPais: "",
  logoUrl: "",
  estado: true,
};

export function StoreInfoPanel({ storeId, canEdit }: StoreInfoPanelProps) {
  const toast = useToast();
  const [store, setStore] = useState<TiendaDetalle | null>(null);
  const [form, setForm] = useState<StoreFormState>(INITIAL_FORM);
  const [availablePaises, setAvailablePaises] = useState<PaisTelefono[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    async function loadStore() {
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
            logoUrl: result.logoUrl,
            estado: result.estado,
          });
        } catch {
          setAvailablePaises([]);
          setForm({
            nombre: result.nombre,
            telefono: result.telefono,
            codigoPais: result.codigoPais,
            logoUrl: result.logoUrl,
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
    }

    void loadStore();
  }, [storeId]);

  const selectedCountry = availablePaises.find(
    (country) => country.codigoPais === form.codigoPais,
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setFeedback(null);
    setError(null);

    try {
      await updateTienda(storeId, form);
      const updated = await fetchTiendaById(storeId);
      setStore(updated);
      setForm({
        nombre: updated.nombre,
        telefono: updated.telefono,
        codigoPais: updated.codigoPais,
        logoUrl: updated.logoUrl,
        estado: updated.estado,
      });
      setFeedback("Informacion de tienda actualizada correctamente.");
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
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,420px)]">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div className="relative">
              <select
                id="store-pais"
                value={form.codigoPais}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    codigoPais: event.target.value,
                  }))
                }
                disabled={!canEdit}
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

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  Codigo de telefono
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--foreground-strong)]">
                  {selectedCountry?.codigoTelefono || "-"}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  Mascara
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--foreground-strong)]">
                  {selectedCountry?.mascaraTelefono || "-"}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  Codigo de moneda
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--foreground-strong)]">
                  {selectedCountry
                    ? `${selectedCountry.monedaNombre} · ${selectedCountry.simboloMoneda} · ${selectedCountry.monedaCodigo}`
                    : "-"}
                </p>
              </div>
            </div>
          </div>

          <MaterialInput
            id="store-telefono"
            label="Numero telefonico"
            type="tel"
            value={form.telefono}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                telefono: event.target.value,
              }))
            }
            disabled={!canEdit}
            className="disabled:opacity-70"
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label
                htmlFor="store-logo-url"
                className="text-sm font-semibold text-[var(--foreground-strong)]"
              >
                URL del logo
              </label>
              <span className="text-xs text-[var(--muted)]">
                Visible en la vista previa lateral
              </span>
            </div>
            <MaterialInput
              id="store-logo-url"
              label="URL del logo"
              value={form.logoUrl}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  logoUrl: event.target.value,
                }))
              }
              disabled={!canEdit}
              className="w-full disabled:opacity-70"
            />
          </div>

          {feedback ? (
            <p className="app-alert-success rounded-2xl px-4 py-3 text-sm">
              {feedback}
            </p>
          ) : null}

          {error ? (
            <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 border-t border-[var(--line)] pt-4 sm:flex-row sm:items-center sm:justify-between">
            {canEdit ? (
              <p className="text-sm text-[var(--muted)]">
                Tus cambios afectan la tarjeta principal de la tienda.
              </p>
            ) : (
              <p className="text-sm text-[var(--muted)]">
                Solo lectura segun tus permisos actuales.
              </p>
            )}

            {canEdit ? (
              <button
                type="submit"
                disabled={isSaving}
                className="app-button-primary inline-flex items-center justify-center rounded-lg px-4 py-3 text-sm font-semibold disabled:opacity-60"
              >
                {isSaving ? "Guardando..." : "Guardar cambios"}
              </button>
            ) : null}
          </div>
        </form>

        <aside className="app-card flex flex-col gap-4 rounded-2xl p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
          <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[linear-gradient(180deg,var(--panel-muted)_0%,color-mix(in_srgb,var(--panel)_82%,var(--accent-soft)_18%)_100%)]">
            <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  Identidad visual
                </p>
                <p className="mt-1 text-sm font-semibold text-[var(--foreground-strong)]">
                  Previsualizacion del logo
                </p>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  store?.estado ? "app-badge-success" : "app-badge-danger"
                }`}
              >
                {store?.estado ? "Activa" : "Inactiva"}
              </span>
            </div>

            <div className="relative flex h-60 items-center justify-center overflow-hidden bg-[linear-gradient(135deg,color-mix(in_srgb,var(--panel-muted)_88%,white_12%)_0%,color-mix(in_srgb,var(--accent-soft)_56%,var(--panel)_44%)_100%)] px-5">
              <div className="absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_top_right,color-mix(in_srgb,var(--accent)_18%,transparent)_0,transparent_42%),radial-gradient(circle_at_bottom_left,color-mix(in_srgb,var(--accent)_10%,transparent)_0,transparent_40%)]" />
              {store?.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={store.logoUrl}
                  alt={store.nombre}
                  className="relative z-10 max-h-44 w-full max-w-[16rem] rounded-2xl object-contain shadow-[0_18px_38px_rgba(15,23,42,0.12)]"
                />
              ) : (
                <div className="relative z-10 flex h-full w-full items-center justify-center rounded-2xl border border-dashed border-[var(--line)] bg-[color-mix(in_srgb,var(--panel)_82%,transparent)] text-sm text-[var(--muted)]">
                  Sin logo disponible
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Slug publico
              </p>
              <p className="mt-2 truncate text-sm font-semibold text-[var(--foreground-strong)]">
                /{store?.slug}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Subdominio
              </p>
              <p className="mt-2 truncate text-sm font-semibold text-[var(--foreground-strong)]">
                {store?.subdominio || "-"}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Auditoria
              </p>
              <div className="mt-2 space-y-1 text-sm">
                <p className="text-[var(--foreground-strong)]">
                  Creada por{" "}
                  <span className="font-semibold">
                    {store?.createdBy || "Sistema"}
                  </span>
                </p>
                <p className="text-[var(--foreground-strong)]">
                  Actualizada por{" "}
                  <span className="font-semibold">
                    {store?.updatedBy || "Sistema"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
