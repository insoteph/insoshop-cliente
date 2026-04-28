"use client";

import Link from "next/link";
import { useState } from "react";

import { formatCurrency } from "@/modules/core/lib/formatters";
import type { PublicStoreProduct } from "@/modules/store-catalog/types/store-catalog-types";

type StoreProductCardProps = {
  slug: string;
  product: PublicStoreProduct;
  currency: string;
  isFavorite?: boolean;
  onToggleFavorite?: (product: PublicStoreProduct) => void;
};

export function StoreProductCard({
  slug,
  product,
  currency,
  isFavorite = false,
  onToggleFavorite,
}: StoreProductCardProps) {
  const primaryImage = product.imagenes[0]?.trim();
  const isAvailable = product.cantidadDisponible > 0;
  const detailHref = `/${encodeURIComponent(slug)}/productos/${product.id}`;
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);
  const canToggleFavorite = typeof onToggleFavorite === "function";
  const priceLabel = formatCurrency(product.precio, currency);
  const stockLabel = isAvailable
    ? `${product.cantidadDisponible} disponibles`
    : "Sin inventario";

  const handleFavoriteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsHeartAnimating(true);
    window.setTimeout(() => setIsHeartAnimating(false), 220);
    onToggleFavorite?.(product);
  };

  return (
    <article className="group overflow-hidden rounded-[18px] border border-[var(--line)] bg-white shadow-[0_8px_20px_rgba(15,23,42,0.06)] transition duration-300 active:scale-[0.985] hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)] sm:rounded-[26px] sm:shadow-[0_14px_34px_rgba(15,23,42,0.08)] sm:active:scale-100">
      <Link href={detailHref} className="block">
        <div className="relative aspect-square w-full overflow-hidden bg-[var(--panel-muted)] sm:aspect-[4/4.6] lg:aspect-[4/4.8]">
          {primaryImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={primaryImage}
              alt={product.nombre}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,var(--panel-muted),rgba(255,255,255,0.6))] text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
              Sin imagen
            </div>
          )}

          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,15,30,0)_45%,rgba(8,15,30,0.2)_100%)]" />

          <div className="absolute left-3 top-3 hidden items-center gap-2 sm:flex">
            <span
              className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] backdrop-blur-md ${
                isAvailable
                  ? "border-[#C7D8FB] bg-white/90 text-[#2563EB]"
                  : "border-red-200/80 bg-red-50/90 text-red-600"
              }`}
            >
              {isAvailable ? "Disponible" : "Agotado"}
            </span>
          </div>

          {canToggleFavorite ? (
            <button
              type="button"
              aria-label={
                isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"
              }
              onClick={handleFavoriteClick}
              className={`absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur-md transition-all sm:right-3 sm:top-3 sm:h-9 sm:w-9 ${
                isFavorite
                  ? "border-[#ffd2d0] bg-white/95 text-[#e53935] shadow-[0_10px_24px_rgba(229,57,53,0.2)]"
                  : "border-white/70 bg-white/80 text-[var(--muted)] shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
              } ${isHeartAnimating ? "scale-90" : "scale-100 hover:scale-105"}`}
            >
              <span
                aria-hidden="true"
                className={`h-3.5 w-3.5 transition-all sm:h-4 sm:w-4 ${isHeartAnimating ? "scale-125" : "scale-100"}`}
                style={{
                  WebkitMaskImage: "url(/icons/heart.svg)",
                  maskImage: "url(/icons/heart.svg)",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  WebkitMaskPosition: "center",
                  maskPosition: "center",
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  backgroundColor: "currentColor",
                  opacity: isFavorite ? 1 : 0.84,
                }}
              />
            </button>
          ) : null}
        </div>

        <div className="space-y-2 p-2.5 sm:space-y-3 sm:p-5">
          <div className="space-y-1 sm:space-y-2">
            <p className="line-clamp-1 text-[8.5px] font-semibold uppercase tracking-[0.1em] text-[#2563EB] sm:text-[11px] sm:tracking-[0.22em]">
              {product.categoria}
            </p>
            <p className="line-clamp-2 min-h-[2rem] text-[0.84rem] font-semibold leading-[1.18] text-[var(--foreground-strong)] sm:min-h-0 sm:text-[1.02rem] sm:leading-[1.15] sm:tracking-[-0.02em]">
              {product.nombre}
            </p>
          </div>

          <div className="grid gap-1.5 rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-2.5 py-2 sm:flex sm:items-center sm:justify-between sm:gap-3 sm:px-3 sm:py-2.5">
            <div className="min-w-0 space-y-0.5">
              <p className="text-[8.5px] font-semibold uppercase tracking-[0.1em] text-[#2563EB] sm:text-[10px] sm:tracking-[0.16em]">
                Precio
              </p>
              <p className="truncate text-[0.9rem] font-bold text-[var(--foreground-strong)] sm:text-[1.15rem] sm:tracking-[-0.02em]">
                {priceLabel}
              </p>
            </div>
            <span
              className={`w-full rounded-full border px-2 py-1 text-center text-[10px] font-semibold sm:w-auto sm:max-w-[8rem] sm:px-2.5 sm:text-right ${
                isAvailable
                  ? "border-[#C7D8FB] bg-white text-[#2563EB]"
                  : "border-red-200 bg-red-50 text-red-600"
              }`}
            >
              {stockLabel}
            </span>
          </div>
        </div>
      </Link>

      <div className="hidden px-3 pb-3 sm:block sm:px-5 sm:pb-5">
        <Link
          href={detailHref}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-[var(--line)] bg-white px-3 py-2 text-xs font-semibold text-[var(--foreground)] shadow-[0_8px_18px_rgba(15,23,42,0.07)] transition hover:border-[var(--line-strong)] hover:bg-[var(--panel-muted)] sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm sm:shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
        >
          Ver detalles
          <span
            aria-hidden="true"
            className="inline-block h-4 w-4"
            style={{
              WebkitMaskImage: "url(/icons/right.svg)",
              maskImage: "url(/icons/right.svg)",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskPosition: "center",
              WebkitMaskSize: "contain",
              maskSize: "contain",
              backgroundColor: "currentColor",
            }}
          />
        </Link>
      </div>
    </article>
  );
}
