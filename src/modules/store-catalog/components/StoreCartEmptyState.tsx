"use client";

export function StoreCartEmptyState() {
  return (
    <div className="rounded-[32px] border border-[#dbe7ff] bg-white px-4 py-16 text-center shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
      <p className="text-lg font-semibold text-[var(--foreground)]">
        Tu carrito esta vacio.
      </p>
    </div>
  );
}
