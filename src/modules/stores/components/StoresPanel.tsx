"use client";

import { useStoreContext } from "@/modules/stores/context/StoreContext";

export function StoresPanel() {
  const { stores, activeStoreId, setActiveStoreId, isLoading, error } =
    useStoreContext();

  return (
    <section className="section-grid">
      <div className="panel-card">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          Tiendas disponibles
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
          Cambia la tienda activa
        </h2>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Toda la información del panel se filtra con la tienda activa usando el
          estado global del frontend y el header `X-Tienda-Id`.
        </p>
        {error ? (
          <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stores.map((store) => {
          const isActive = store.id === activeStoreId;

          return (
            <button
              key={store.id}
              type="button"
              className="panel-card text-left transition hover:border-[var(--accent)]"
              onClick={() => setActiveStoreId(store.id)}
              disabled={isLoading}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                {isActive ? "Activa" : "Disponible"}
              </p>
              <h3 className="mt-3 text-xl font-semibold text-[var(--foreground)]">
                {store.nombre}
              </h3>
              <p className="mt-2 text-sm text-[var(--muted)]">
                /{store.slug}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
