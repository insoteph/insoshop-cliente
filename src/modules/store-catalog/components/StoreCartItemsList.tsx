"use client";

import type { StoreCartItem } from "@/modules/store-catalog/types/store-cart-types";
import { StoreCartItemCard } from "@/modules/store-catalog/components/StoreCartItemCard";

type StoreCartItemsListProps = {
  items: StoreCartItem[];
  currency: string;
  onRemove: (productoVarianteId: number) => void;
  onDecrease: (productoVarianteId: number, currentQuantity: number) => void;
  onIncrease: (productoVarianteId: number, currentQuantity: number) => void;
};

export function StoreCartItemsList({
  items,
  currency,
  onRemove,
  onDecrease,
  onIncrease,
}: StoreCartItemsListProps) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <StoreCartItemCard
          key={item.productoVarianteId}
          item={item}
          currency={currency}
          onRemove={onRemove}
          onDecrease={onDecrease}
          onIncrease={onIncrease}
        />
      ))}
    </div>
  );
}
