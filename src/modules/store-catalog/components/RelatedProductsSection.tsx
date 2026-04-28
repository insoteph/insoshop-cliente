"use client";

import { useEffect, useMemo, useState } from "react";

import { StoreProductCard } from "@/modules/store-catalog/components/StoreProductCard";
import { fetchPublicStoreProducts } from "@/modules/store-catalog/services/store-catalog-service";
import type { PublicStoreProduct } from "@/modules/store-catalog/types/store-catalog-types";

type RelatedProductsSectionProps = {
  slug: string;
  categoryName: string;
  currentProductId: number;
  currency: string;
  favoriteIds?: Set<number>;
  onToggleFavorite?: (product: PublicStoreProduct) => void;
};

export function RelatedProductsSection({
  slug,
  categoryName,
  currentProductId,
  currency,
  favoriteIds,
  onToggleFavorite,
}: RelatedProductsSectionProps) {
  const [items, setItems] = useState<PublicStoreProduct[]>([]);

  useEffect(() => {
    let active = true;

    const timeoutId = window.setTimeout(async () => {
      try {
        const result = await fetchPublicStoreProducts({
          slug,
          page: 1,
          pageSize: 120,
        });

        const related = result.productos.items.filter(
          (product) =>
            product.id !== currentProductId &&
            product.categoria.trim().toLowerCase() ===
              categoryName.trim().toLowerCase(),
        );

        if (active) {
          setItems(related);
        }
      } catch {
        if (active) {
          setItems([]);
        }
      }
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [categoryName, currentProductId, slug]);

  const hasRelatedProducts = useMemo(() => items.length > 0, [items.length]);

  if (!hasRelatedProducts) {
    return null;
  }

  return (
    <section className="rounded-[28px] border border-[var(--line)] bg-[var(--panel-strong)] p-4 shadow-[var(--shadow)] md:p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[var(--foreground-strong)] md:text-xl">
          Tambien podria interesarte
        </h2>
        <p className="text-xs text-[var(--muted)] md:text-sm">
          Otros productos de esta tienda en la misma categoria.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((product) => (
          <StoreProductCard
            key={product.id}
            slug={slug}
            product={product}
            currency={currency}
            isFavorite={favoriteIds?.has(product.id) ?? false}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </section>
  );
}
