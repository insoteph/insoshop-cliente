"use client";

export function ProductsCatalogEmptyState() {
  return (
    <div className="rounded-[28px] border border-dashed border-[var(--line)] bg-[var(--panel)] px-5 py-12 text-center shadow-none sm:px-8 sm:py-14">
      <p className="text-lg font-semibold text-[var(--foreground-strong)]">
        No hay productos para mostrar
      </p>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Prueba con otra búsqueda o crea un nuevo producto para comenzar.
      </p>
    </div>
  );
}
