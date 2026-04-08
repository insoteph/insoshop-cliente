"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { StoreProductCard } from "@/modules/store-catalog/components/StoreProductCard";
import { fetchPublicStoreProducts } from "@/modules/store-catalog/services/store-catalog-service";
import type { PublicStoreProduct } from "@/modules/store-catalog/types/store-catalog-types";

type RelatedProductsSectionProps = {
  slug: string;
  categoryName: string;
  currentProductId: number;
  currency: string;
};

export function RelatedProductsSection({
  slug,
  categoryName,
  currentProductId,
  currency,
}: RelatedProductsSectionProps) {
  const [items, setItems] = useState<PublicStoreProduct[]>([]);

  const loadRelatedProducts = useCallback(async () => {
    try {
      const result = await fetchPublicStoreProducts({
        slug,
        page: 1,
        pageSize: 80,
      });

      const related = result.productos.items.filter(
        (product) =>
          product.id !== currentProductId &&
          product.categoria.trim().toLowerCase() === categoryName.trim().toLowerCase(),
      );

      setItems(related.slice(0, 8));
    } catch {
      setItems([]);
    }
  }, [categoryName, currentProductId, slug]);

  useEffect(() => {
    void loadRelatedProducts();
  }, [loadRelatedProducts]);

  const hasRelatedProducts = useMemo(() => items.length > 0, [items.length]);

  if (!hasRelatedProducts) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-[var(--foreground-strong)]">
          Productos relacionados
        </h2>
        <p className="text-sm text-[var(--muted)]">
          Productos de la misma categoria que podrian interesarte.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((product) => (
          <StoreProductCard
            key={product.id}
            slug={slug}
            product={product}
            currency={currency}
          />
        ))}
      </div>
    </section>
  );
}
