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

  const handleFavoriteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsHeartAnimating(true);
    window.setTimeout(() => setIsHeartAnimating(false), 220);
    onToggleFavorite?.(product);
  };

  return (
    <article className="group overflow-hidden rounded-[20px] border border-[var(--line)] bg-[var(--panel-strong)] p-2 shadow-[var(--shadow)] transition duration-300 hover:-translate-y-1 sm:rounded-[24px] sm:p-3">
      <Link href={detailHref} className="block">
        <div className="relative h-36 w-full overflow-hidden rounded-[16px] bg-[var(--panel-muted)] sm:h-64 sm:rounded-[20px]">
          {primaryImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={primaryImage}
              alt={product.nombre}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              NO IMAGE
            </div>
          )}

          <div className="absolute left-2 top-2 flex items-center gap-2 sm:left-3 sm:top-3">
            <span
              className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-[0.16em] sm:px-2.5 sm:text-[10px] sm:tracking-[0.18em] ${
                isAvailable
                  ? "bg-blue-600 text-white"
                  : "bg-[#fff1f0] text-[#c8493d]"
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
              className={`absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border bg-[var(--panel-strong)] transition-all sm:right-3 sm:top-3 sm:h-9 sm:w-9 ${
                isFavorite
                  ? "border-[#ffd2d0] text-[#e53935] shadow-[0_10px_20px_rgba(229,57,53,0.24)]"
                  : "border-[var(--line)] text-[var(--muted)]"
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

        <div className="space-y-2 px-1 pb-1 pt-3 sm:space-y-3 sm:pt-4">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)] sm:text-[11px] sm:tracking-[0.22em]">
              {product.categoria}
            </p>
            <p className="line-clamp-1 text-sm font-semibold text-[var(--foreground-strong)] sm:text-[1.02rem]">
              {product.nombre}
            </p>
          </div>

          <p className="line-clamp-2 min-h-8 text-xs leading-4 text-[var(--muted)] sm:min-h-10 sm:text-sm sm:leading-5">
            {product.descripcion}
          </p>

          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <div>
              <p className="text-[11px] text-[var(--muted)]">Precio</p>
              <p className="text-sm font-bold text-[var(--foreground-strong)] sm:text-lg">
                {formatCurrency(product.precio, currency)}
              </p>
            </div>
            <span className="text-[10px] font-medium text-[var(--muted)] sm:text-xs">
              {isAvailable
                ? `${product.cantidadDisponible} disponibles`
                : "Sin inventario"}
            </span>
          </div>
        </div>
      </Link>

      <div className="mt-2">
        <Link
          href={detailHref}
          className="inline-flex w-full items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--panel-muted)] px-3 py-2.5 text-xs font-semibold text-[var(--foreground)] hover:border-[var(--line-strong)] sm:rounded-2xl sm:px-3 sm:py-3 sm:text-sm"
        >
          {isAvailable ? "Ver opciones" : "Ver detalles"}
        </Link>
      </div>
    </article>
  );
}
