"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { formatCurrency } from "@/modules/core/lib/formatters";
import { useStoreCart } from "@/modules/store-catalog/providers/StoreCartProvider";
import type { PublicStoreProduct } from "@/modules/store-catalog/types/store-catalog-types";

type StoreProductCardProps = {
  slug: string;
  product: PublicStoreProduct;
  currency: string;
};

export function StoreProductCard({ slug, product, currency }: StoreProductCardProps) {
  const router = useRouter();
  const { addItem } = useStoreCart();
  const primaryImage = product.imagenes[0]?.trim();
  const isAvailable = product.cantidadDisponible > 0;

  return (
    <article className="group app-card overflow-hidden rounded-3xl transition hover:-translate-y-0.5">
      <Link href={`/${encodeURIComponent(slug)}/productos/${product.id}`} className="block">
        <div className="relative h-56 w-full overflow-hidden bg-[var(--panel-muted)]">
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
          <div className="flex items-center justify-between gap-2">
            <span className="app-badge-neutral line-clamp-1 rounded-full px-2.5 py-1 text-[11px] font-semibold">
              {product.categoria}
            </span>
            {isAvailable ? (
              <span className="app-badge-success rounded-full px-2.5 py-1 text-[11px] font-semibold">
                Disponible
              </span>
            ) : (
              <span className="app-badge-danger rounded-full px-2.5 py-1 text-[11px] font-semibold">
                Agotado
              </span>
            )}
          </div>

          <p className="line-clamp-1 text-base font-semibold text-[var(--foreground-strong)]">
            {product.nombre}
          </p>
          <p className="line-clamp-2 text-sm text-[var(--muted)]">{product.descripcion}</p>

          <p className="text-xl font-bold text-[var(--accent)]">
            {formatCurrency(product.precio, currency)}
          </p>
        </div>
      </Link>

      <div className="grid gap-2 px-4 pb-4 sm:grid-cols-2">
        <button
          type="button"
          disabled={!isAvailable}
          className="app-button-secondary rounded-xl px-3 py-2 text-sm font-semibold disabled:pointer-events-none disabled:opacity-50"
          onClick={() =>
            addItem({
              productId: product.id,
              nombre: product.nombre,
              precio: product.precio,
              cantidad: 1,
              cantidadDisponible: product.cantidadDisponible,
              categoria: product.categoria,
              imagenUrl: primaryImage || null,
            })
          }
        >
          Agregar al carrito
        </button>
        <button
          type="button"
          disabled={!isAvailable}
          className="app-button-primary rounded-xl px-3 py-2 text-sm font-semibold disabled:pointer-events-none disabled:opacity-50"
          onClick={() => {
            addItem({
              productId: product.id,
              nombre: product.nombre,
              precio: product.precio,
              cantidad: 1,
              cantidadDisponible: product.cantidadDisponible,
              categoria: product.categoria,
              imagenUrl: primaryImage || null,
            });
            router.push(`/${encodeURIComponent(slug)}/carrito`);
          }}
        >
          Comprar ahora
        </button>
      </div>
    </article>
  );
}

