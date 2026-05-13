"use client";

import { formatCurrency } from "@/modules/core/lib/formatters";
import { NoImageThumbnail } from "@/modules/products/components/shared/ProductVisuals";
import type { Product } from "@/modules/products/services/product-service";

import { getProductPrimaryImageUrl } from "./product-catalog.utils";
import { ProductCatalogCardActions } from "./ProductCatalogCardActions";

type ProductCatalogCardProps = {
  product: Product;
  currency: string;
  canEditProducts: boolean;
  canDeleteProducts: boolean;
  onOpenDetail: (product: Product) => void;
  onEdit: (product: Product) => void;
  onToggleStatus: (product: Product) => void;
};

function ProductStatusChip({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-[12px] font-medium ${
        active
          ? "bg-[var(--success-soft)] text-[var(--success)]"
          : "bg-[var(--danger-soft)] text-[var(--danger)]"
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-2.5 w-2.5 rounded-full ${
          active ? "bg-[var(--success)]" : "bg-[var(--danger)]"
        }`}
      />
      {active ? "Activo" : "Inactivo"}
    </span>
  );
}

function ImageCountBadge({ count }: { count: number }) {
  if (count <= 0) {
    return null;
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(17,24,39,0.82)] px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
      <span
        aria-hidden="true"
        className="h-3.5 w-3.5 bg-current"
        style={{
          WebkitMaskImage: "url(/icons/box.svg)",
          maskImage: "url(/icons/box.svg)",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          WebkitMaskSize: "contain",
          maskSize: "contain",
        }}
      />
      {count}
    </span>
  );
}

export function ProductCatalogCard({
  product,
  currency,
  canEditProducts,
  canDeleteProducts,
  onOpenDetail,
  onEdit,
  onToggleStatus,
}: ProductCatalogCardProps) {
  const imageUrl = getProductPrimaryImageUrl(product);
  const imageCount = product.imagenes.filter((image) => image.url.trim()).length;

  return (
    <article className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel)] transition duration-200 hover:border-[var(--line-strong)]">
      <div className="grid grid-cols-[78px_minmax(0,1fr)_auto] gap-3 p-4 sm:grid-cols-[92px_minmax(0,1fr)_auto] sm:gap-4 sm:p-5 md:grid-cols-[98px_minmax(0,1fr)_auto]">
        <button
          type="button"
          onClick={() => onOpenDetail(product)}
          className="group relative h-[84px] w-[78px] overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] sm:h-[96px] sm:w-[92px] md:h-[100px] md:w-[98px]"
          aria-label={`Ver detalle de ${product.nombre}`}
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={product.nombre}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--panel-strong)]">
              <NoImageThumbnail
                size={40}
                className="flex items-center justify-center overflow-hidden rounded-none border-0 bg-transparent"
              />
            </div>
          )}

          <span className="absolute bottom-2 right-2">
            <ImageCountBadge count={imageCount} />
          </span>

        </button>

        <div className="min-w-0 self-center">
          <div className="flex items-start gap-2">
            <h3 className="min-w-0 max-w-full truncate text-[13px] font-semibold leading-tight text-[var(--foreground-strong)] sm:text-[14px]">
              {product.nombre}
            </h3>
          </div>

          <div className="mt-1.5">
            <ProductStatusChip active={product.estado} />
          </div>

          <p className="mt-2 text-[12px] font-semibold leading-tight text-[var(--foreground-strong)] sm:text-[13px]">
            {formatCurrency(product.precio, currency)}
          </p>

          <p className="mt-1 text-[12px] text-[var(--muted)] sm:text-[13px]">
            Stock: {product.cantidad}
          </p>
        </div>

        <div className="flex items-center justify-end self-center">
          <ProductCatalogCardActions
            product={product}
            canEditProducts={canEditProducts}
            canDeleteProducts={canDeleteProducts}
            onOpenDetail={onOpenDetail}
            onEdit={onEdit}
            onToggleStatus={onToggleStatus}
          />
        </div>
      </div>
    </article>
  );
}
