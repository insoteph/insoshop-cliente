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

  const handleFavoriteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsHeartAnimating(true);
    window.setTimeout(() => setIsHeartAnimating(false), 220);
    onToggleFavorite?.(product);
  };

  return (
    <article className="group overflow-hidden rounded-[26px] border border-[var(--line)] bg-white shadow-[0_14px_34px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
      <Link href={detailHref} className="block">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-[var(--panel-muted)] sm:aspect-[4/4.6] lg:aspect-[4/4.8]">
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

          <div className="absolute left-3 top-3 flex items-center gap-2">
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
              className={`absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md transition-all ${
                isFavorite
                  ? "border-[#ffd2d0] bg-white/95 text-[#e53935] shadow-[0_10px_24px_rgba(229,57,53,0.2)]"
                  : "border-white/70 bg-white/80 text-[var(--muted)] shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
              } ${isHeartAnimating ? "scale-90" : "scale-100 hover:scale-105"}`}
            >
              <span
                aria-hidden="true"
                className={`h-4 w-4 transition-all ${isHeartAnimating ? "scale-125" : "scale-100"}`}
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

        <div className="space-y-3 p-4 sm:p-5">
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2563EB] sm:text-[11px] sm:tracking-[0.22em]">
              {product.categoria}
            </p>
            <p className="line-clamp-2 text-[1.02rem] font-semibold leading-[1.15] tracking-[-0.02em] text-[var(--foreground-strong)]">
              {product.nombre}
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-3 py-2.5">
            <div className="space-y-0.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#2563EB]">
                Precio
              </p>
              <p className="text-[1.05rem] font-bold tracking-[-0.02em] text-[var(--foreground-strong)] sm:text-[1.15rem]">
                {priceLabel}
              </p>
            </div>
            <span className="max-w-[8rem] rounded-full border border-[var(--line)] bg-[var(--panel)] px-2.5 py-1 text-right text-[10px] font-semibold text-[var(--muted)]">
              {isAvailable
                ? `${product.cantidadDisponible} disponibles`
                : "Sin inventario"}
            </span>
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4 sm:px-5 sm:pb-5">
        <Link
          href={detailHref}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition hover:border-[var(--line-strong)] hover:bg-[var(--panel-muted)]"
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
