"use client";

import Link from "next/link";

import { formatCurrency } from "@/modules/core/lib/formatters";
import { useStoreCart } from "@/modules/store-catalog/providers/StoreCartProvider";
import type { PublicStoreProduct } from "@/modules/store-catalog/types/store-catalog-types";

type StoreProductCardProps = {
  slug: string;
  product: PublicStoreProduct;
  currency: string;
};

export function StoreProductCard({ slug, product, currency }: StoreProductCardProps) {
  const { addItem } = useStoreCart();
  const primaryImage = product.imagenes[0]?.trim();
  const isAvailable = product.cantidadDisponible > 0;
  const detailHref = `/${encodeURIComponent(slug)}/productos/${product.id}`;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      nombre: product.nombre,
      precio: product.precio,
      cantidad: 1,
      cantidadDisponible: product.cantidadDisponible,
      categoria: product.categoria,
      imagenUrl: primaryImage || null,
    });
  };

  return (
    <article className="group overflow-hidden rounded-[24px] border border-[#e8ebf5] bg-white p-3 shadow-[0_14px_30px_rgba(41,54,111,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_36px_rgba(41,54,111,0.1)]">
      <Link href={detailHref} className="block">
        <div className="relative h-64 w-full overflow-hidden rounded-[20px] bg-[#f4f6fb]">
          {primaryImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={primaryImage}
              alt={product.nombre}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm font-medium text-[#8e95ab]">
              Imagen no disponible
            </div>
          )}

          <div className="absolute left-3 top-3 flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                isAvailable
                  ? "bg-[#efeaff] text-[#6d38ff]"
                  : "bg-[#fff1f0] text-[#c8493d]"
              }`}
            >
              {isAvailable ? "Disponible" : "Agotado"}
            </span>
          </div>

          <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-[#edf0f8] bg-white/92 text-[#a5abc0]">
            <span aria-hidden="true">♡</span>
          </div>
        </div>

        <div className="space-y-3 px-1 pb-1 pt-4">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a91ac]">
              {product.categoria}
            </p>
            <p className="line-clamp-1 text-[1.02rem] font-semibold text-[#191b2a]">
              {product.nombre}
            </p>
          </div>

          <p className="line-clamp-2 min-h-10 text-sm leading-5 text-[#6a728d]">
            {product.descripcion}
          </p>

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] text-[#8a91ac]">Precio</p>
              <p className="text-lg font-bold text-[#191b2a]">
                {formatCurrency(product.precio, currency)}
              </p>
            </div>
            <span className="text-xs font-medium text-[#8a91ac]">
              {isAvailable
                ? `${product.cantidadDisponible} disponibles`
                : "Sin inventario"}
            </span>
          </div>
        </div>
      </Link>

      <div className="mt-2 grid grid-cols-[minmax(0,1fr)_44px] gap-2">
        <Link
          href={detailHref}
          className="inline-flex items-center justify-center rounded-2xl border border-[#e6e9f4] bg-[#f8f9fe] px-3 py-3 text-sm font-semibold text-[#20253d] hover:border-[#d7dcf0]"
        >
          Ver detalles
        </Link>
        <button
          type="button"
          disabled={!isAvailable}
          className="inline-flex items-center justify-center rounded-2xl bg-[#6d38ff] text-sm font-semibold text-white shadow-[0_16px_26px_rgba(109,56,255,0.18)] disabled:pointer-events-none disabled:opacity-50"
          onClick={handleAddToCart}
        >
          <span
            aria-hidden="true"
            className="h-4 w-4 text-white"
            style={{
              WebkitMaskImage: "url(/icons/Cart.svg)",
              maskImage: "url(/icons/Cart.svg)",
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
    </article>
  );
}
