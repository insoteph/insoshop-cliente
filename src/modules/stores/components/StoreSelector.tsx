"use client";

import type { StoreOption } from "@/modules/stores/services/store-service";

type StoreSelectorProps = {
  stores: StoreOption[];
  activeStoreId: number | null;
  isLoading: boolean;
  onChange: (storeId: number) => void;
};

export function StoreSelector({
  stores,
  activeStoreId,
  isLoading,
  onChange,
}: StoreSelectorProps) {
  const showSelector = stores.length > 1;

  if (!stores.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--line)] px-4 py-3 text-sm text-[var(--muted)]">
        No hay tiendas disponibles para este usuario.
      </div>
    );
  }

  if (!showSelector) {
    return (
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          Tienda activa
        </p>
        <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">
          {stores[0]?.nombre}
        </p>
      </div>
    );
  }

  return (
    <label className="block space-y-2">
      <span className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
        Tienda activa
      </span>
      <select
        className="w-full rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-3 py-3 text-sm outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
        value={activeStoreId ?? ""}
        onChange={(event) => onChange(Number(event.target.value))}
        disabled={isLoading}
      >
        {stores.map((store) => (
          <option key={store.id} value={store.id}>
            {store.nombre}
          </option>
        ))}
      </select>
    </label>
  );
}
