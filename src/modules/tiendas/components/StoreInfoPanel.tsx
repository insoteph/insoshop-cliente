"use client";

import { useEffect, useState } from "react";

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
            : "No se pudo cargar la tienda."
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
      setFeedback("Información de tienda actualizada correctamente.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo actualizar la tienda."
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <section className="panel-card">
        <p className="text-sm text-[var(--muted)]">Cargando información...</p>
      </section>
    );
  }

  if (error && !store) {
    return (
      <section className="panel-card">
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_340px]">
        <form className="panel-card space-y-4" onSubmit={handleSubmit}>
          <div>
            <h3 className="text-lg font-semibold text-[var(--foreground)]">
              Información general
            </h3>
            <p className="text-sm text-[var(--muted)]">
              Configura nombre, contacto, moneda, logo y estado operativo.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              value={form.nombre}
              onChange={(event) =>
                setForm((current) => ({ ...current, nombre: event.target.value }))
              }
              disabled={!canEdit}
              placeholder="Nombre"
              className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3 text-sm text-[var(--foreground)] outline-none disabled:opacity-70"
            />
            <input
              value={form.telefono}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  telefono: event.target.value,
                }))
              }
              disabled={!canEdit}
              placeholder="Teléfono"
              className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3 text-sm text-[var(--foreground)] outline-none disabled:opacity-70"
            />
            <input
              value={form.moneda}
              onChange={(event) =>
                setForm((current) => ({ ...current, moneda: event.target.value }))
              }
              disabled={!canEdit}
              placeholder="Moneda"
              className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3 text-sm text-[var(--foreground)] outline-none disabled:opacity-70"
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

          <input
            value={form.logoUrl}
            onChange={(event) =>
              setForm((current) => ({ ...current, logoUrl: event.target.value }))
            }
            disabled={!canEdit}
            placeholder="URL del logo"
            className="w-full rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3 text-sm text-[var(--foreground)] outline-none disabled:opacity-70"
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
              Solo lectura según tus permisos actuales.
            </p>
          )}
        </form>

        <div className="panel-card space-y-4">
          <div className="overflow-hidden rounded-[1.75rem] border border-[var(--line)] bg-[var(--panel-muted)]">
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
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                Slug público
              </p>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                /{store?.slug}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                Creada el
              </p>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                {store ? formatDate(store.createdAt) : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                Última actualización
              </p>
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
