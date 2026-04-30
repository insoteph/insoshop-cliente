"use client";

import { formatCurrency } from "@/modules/core/lib/formatters";
import type { StoreCartItem } from "@/modules/store-catalog/types/store-cart-types";

type StoreCartItemCardProps = {
  item: StoreCartItem;
  currency: string;
  onRemove: (productoVarianteId: number) => void;
  onDecrease: (productoVarianteId: number, currentQuantity: number) => void;
  onIncrease: (productoVarianteId: number, currentQuantity: number) => void;
};

export function StoreCartItemCard({
  item,
  currency,
  onRemove,
  onDecrease,
  onIncrease,
}: StoreCartItemCardProps) {
  return (
    <article className="rounded-[28px] border border-[#dbe7ff] bg-white p-4 shadow-[0_16px_36px_rgba(15,23,42,0.06)]">
      <div className="flex items-center gap-4">
        <div className="flex min-w-0 flex-1 gap-3">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-[#dbe7ff] bg-[#F8FBFF]">
            {item.imagenUrl?.trim() ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.imagenUrl.trim()}
                alt={item.nombre}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                NO IMAGE
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <p className="truncate text-base font-semibold text-[var(--foreground-strong)]">
              {item.nombre}
            </p>
            <p className="text-sm text-[#64748B]">{item.categoria}</p>
            {item.varianteResumen ? (
              <p className="text-xs font-medium text-[#64748B]">
                {item.varianteResumen}
              </p>
            ) : null}
            <p className="text-sm font-medium text-[#2563EB]">
              {formatCurrency(item.precio, currency)}
            </p>
          </div>
        </div>

        <div className="flex h-full shrink-0 items-center">
          <div className="flex h-[8.75rem] w-[3.25rem] flex-col items-center justify-between rounded-[20px] border border-[#dbe7ff] bg-[#F8FBFF] p-1.5">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-[var(--foreground)] disabled:opacity-50"
              onClick={() => onDecrease(item.productoVarianteId, item.cantidad)}
              disabled={item.cantidad <= 1}
            >
              <span
                aria-hidden="true"
                className="h-5 w-5 text-[#2563EB]"
                style={{
                  WebkitMaskImage: "url(/icons/minus-circle.svg)",
                  maskImage: "url(/icons/minus-circle.svg)",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  WebkitMaskPosition: "center",
                  maskPosition: "center",
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  backgroundColor: "currentColor",
                }}
              />
            </button>
            <span className="w-full text-center text-sm font-semibold text-[var(--foreground)]">
              {item.cantidad}
            </span>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-[var(--foreground)] disabled:opacity-50"
              onClick={() => onIncrease(item.productoVarianteId, item.cantidad)}
              disabled={item.cantidad >= item.cantidadDisponible}
            >
              <span
                aria-hidden="true"
                className="h-5 w-5 text-[#2563EB]"
                style={{
                  WebkitMaskImage: "url(/icons/plus-circle.svg)",
                  maskImage: "url(/icons/plus-circle.svg)",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  WebkitMaskPosition: "center",
                  maskPosition: "center",
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  backgroundColor: "currentColor",
                }}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <button
          type="button"
          className="inline-flex rounded-full border border-[#fecaca] bg-[#FEF2F2] px-3 py-1 text-xs font-semibold text-[#DC2626]"
          onClick={() => onRemove(item.productoVarianteId)}
        >
          Quitar
        </button>

        <p className="text-sm font-semibold text-[var(--foreground)]">
          {formatCurrency(item.precio * item.cantidad, currency)}
        </p>
      </div>
    </article>
  );
}
