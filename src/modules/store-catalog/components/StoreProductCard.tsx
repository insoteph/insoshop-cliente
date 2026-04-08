"use client";

import Link from "next/link";

import { formatCurrency } from "@/modules/core/lib/formatters";
import type { PublicStoreProduct } from "@/modules/store-catalog/types/store-catalog-types";

type StoreProductCardProps = {
  slug: string;
  product: PublicStoreProduct;
  currency: string;
};

export function StoreProductCard({ slug, product, currency }: StoreProductCardProps) {
  const primaryImage = product.imagenes[0]?.trim();

  return (
    <article className="group app-card overflow-hidden rounded-3xl">
      <Link href={`/${encodeURIComponent(slug)}/productos/${product.id}`} className="block">
        <div className="relative h-52 w-full overflow-hidden bg-[var(--panel-muted)]">
          {primaryImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={primaryImage}
              alt={product.nombre}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm font-medium text-[var(--muted)]">
              Imagen no disponible
            </div>
          )}
        </div>

        <div className="space-y-3 p-4">
          <p className="line-clamp-1 text-base font-semibold text-[var(--foreground-strong)]">
            {product.nombre}
          </p>
          <p className="line-clamp-2 text-sm text-[var(--muted)]">{product.descripcion}</p>

          <div className="flex items-center justify-between gap-3">
            <p className="text-lg font-bold text-[var(--accent)]">
              {formatCurrency(product.precio, currency)}
            </p>

            {product.cantidadDisponible > 0 ? (
              <span className="app-badge-success rounded-full px-3 py-1 text-xs font-semibold">
                Disponible
              </span>
            ) : null}
          </div>
        </div>
      </Link>

      <div className="grid gap-2 px-4 pb-4 sm:grid-cols-2">
        <button
          type="button"
          className="app-button-secondary rounded-xl px-3 py-2 text-sm font-semibold"
          onClick={() => window.alert("Carrito en construccion. Accion provisional.")}
        >
          Agregar al carrito
        </button>
        <button
          type="button"
          className="app-button-primary rounded-xl px-3 py-2 text-sm font-semibold"
          onClick={() => window.alert("Compra directa en construccion. Accion provisional.")}
        >
          Comprar ahora
        </button>
      </div>
    </article>
  );
}

