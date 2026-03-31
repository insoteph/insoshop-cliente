"use client";

import { useEffect, useMemo, useState } from "react";

type CartItem = {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
};

export function useCart(slug: string) {
  const storageKey = `insoshop.cart.${slug}`;
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const storedValue = window.localStorage.getItem(storageKey);
    if (!storedValue) {
      return [];
    }

    try {
      return JSON.parse(storedValue);
    } catch {
      window.localStorage.removeItem(storageKey);
      return [];
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, storageKey]);

  const total = useMemo(
    () =>
      items.reduce((sum, item) => sum + item.precio * item.cantidad, 0),
    [items]
  );

  return {
    items,
    total,
    addItem: (item: Omit<CartItem, "cantidad">) =>
      setItems((current) => {
        const existing = current.find((currentItem) => currentItem.id === item.id);
        if (existing) {
          return current.map((currentItem) =>
            currentItem.id === item.id
              ? { ...currentItem, cantidad: currentItem.cantidad + 1 }
              : currentItem
          );
        }

        return [...current, { ...item, cantidad: 1 }];
      }),
    updateQuantity: (id: number, cantidad: number) =>
      setItems((current) =>
        current
          .map((item) => (item.id === id ? { ...item, cantidad } : item))
          .filter((item) => item.cantidad > 0)
      ),
    clear: () => setItems([]),
  };
}
