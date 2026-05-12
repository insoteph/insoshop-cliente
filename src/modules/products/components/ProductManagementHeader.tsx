"use client";

import { formatCurrency } from "@/modules/core/lib/formatters";
import type { ProductDetail } from "@/modules/products/services/product-service";

type ProductManagementHeaderProps = {
  product: ProductDetail;
  currency: string;
};

export function ProductManagementHeader({
  product,
  currency,
}: ProductManagementHeaderProps) {
  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
          Configuración de venta
        </p>
        <h3 className="text-[15px] font-semibold text-[var(--foreground-strong)] sm:text-base">
          {product.nombre}
        </h3>
        <p className="max-w-3xl text-[13px] text-[var(--muted)] sm:text-sm">
          Primero define las opciones que verá tu cliente, como color o talla.
          Después crea las combinaciones reales que vas a vender con su precio,
          existencias e imagen.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-none border-0 bg-transparent px-0 py-1 sm:rounded-2xl sm:border sm:border-[var(--line)] sm:bg-[var(--panel-muted)] sm:px-4 sm:py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
            Combinaciones
          </p>
          <p className="mt-1 text-base font-semibold text-[var(--foreground-strong)]">
            {product.variantes.length}
          </p>
        </div>
        <div className="rounded-none border-0 bg-transparent px-0 py-1 sm:rounded-2xl sm:border sm:border-[var(--line)] sm:bg-[var(--panel-muted)] sm:px-4 sm:py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
            Stock total
          </p>
          <p className="mt-1 text-base font-semibold text-[var(--foreground-strong)]">
            {product.cantidad}
          </p>
        </div>
        <div className="rounded-none border-0 bg-transparent px-0 py-1 sm:rounded-2xl sm:border sm:border-[var(--line)] sm:bg-[var(--panel-muted)] sm:px-4 sm:py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
            Precio desde
          </p>
          <p className="mt-1 text-base font-semibold text-[var(--foreground-strong)]">
            {formatCurrency(product.precio, currency)}
          </p>
        </div>
      </div>
    </div>
  );
}
