"use client";

import { useEffect, useState } from "react";

import { MaterialInput } from "@/modules/core/components/MaterialInput";
import { formatDate } from "@/modules/core/lib/formatters";
import {
  fetchTiendaById,
  updateTienda,
} from "@/modules/tiendas/services/tiendas-service";
import type { TiendaDetalle } from "@/modules/tiendas/types/tiendas-types";

type StoreInfoPanelProps = {
  storeId: number;
  canEdit: boolean;
};

type StoreFormState = {
  nombre: string;
  telefono: string;
  moneda: string;
  logoUrl: string;
  estado: boolean;
};

const INITIAL_FORM: StoreFormState = {
  nombre: "",
  telefono: "",
  moneda: "",
  logoUrl: "",
  estado: true,
};

export function StoreInfoPanel({ storeId, canEdit }: StoreInfoPanelProps) {
  const [store, setStore] = useState<TiendaDetalle | null>(null);
  const [form, setForm] = useState<StoreFormState>(INITIAL_FORM);
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
        setForm({
          nombre: result.nombre,
          telefono: result.telefono,
          moneda: result.moneda,
          logoUrl: result.logoUrl,
          estado: result.estado,
        });
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setFeedback(null);
    setError(null);

    try {
      await updateTienda(storeId, form);
      const updated = await fetchTiendaById(storeId);
      setStore(updated);
      setFeedback("Informacion de tienda actualizada correctamente.");
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
      <section className="">
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_340px]">
        <form
          className="px-4 py-2 bg-white rounded-md shadow-md space-y-4"
          onSubmit={handleSubmit}
        >
          <div>
            <h3 className="text-lg font-semibold text-slate-700">
              Informacion general
            </h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <MaterialInput
              id="store-nombre"
              label="Nombre"
              value={form.nombre}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  nombre: event.target.value,
                }))
              }
              disabled={!canEdit}
              className="disabled:opacity-70"
            />
            <MaterialInput
              id="store-telefono"
              label="Telefono"
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
            <MaterialInput
              id="store-moneda"
              label="Moneda"
              value={form.moneda}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  moneda: event.target.value,
                }))
              }
              disabled={!canEdit}
              className="disabled:opacity-70"
            />
            <label className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3 text-sm text-[var(--foreground)]">
              <input
                type="checkbox"
                checked={form.estado}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    estado: event.target.checked,
                  }))
                }
                disabled={!canEdit}
              />
              Tienda activa
            </label>
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

          {feedback ? (
            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {feedback}
            </p>
          ) : null}

          {error ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {canEdit ? (
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-2xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isSaving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          ) : (
            <p className="text-sm text-[var(--muted)]">
              Solo lectura segun tus permisos actuales.
            </p>
          )}
        </form>

        <div className="p-3 bg-white shadow-md rounded-md space-y-4">
          <div className="overflow-hidden rounded-md border border-[var(--line)] bg-[var(--panel-muted)]">
            {store?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={store.logoUrl}
                alt={store.nombre}
                className="h-56 w-full object-cover"
              />
            ) : (
              <div className="flex h-56 items-center justify-center text-sm text-[var(--muted)]">
                Sin logo disponible
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-md text-slate-700">Slug publico</p>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                /{store?.slug}
              </p>
            </div>
            <div>
              <p className="text-md text-slate-700">Creada el</p>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                {store ? formatDate(store.createdAt) : "-"}
              </p>
            </div>
            <div>
              <p className="text-md text-slate-700">Ultima actualizacion</p>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                {store ? formatDate(store.updatedAt) : "-"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
