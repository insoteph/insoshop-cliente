"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  readStoreCart,
  writeStoreCart,
} from "@/modules/store-catalog/lib/store-cart-storage";
import type { StoreCartItem } from "@/modules/store-catalog/types/store-cart-types";

type AddCartItemPayload = {
  productId: number;
  nombre: string;
  precio: number;
  cantidad: number;
  cantidadDisponible: number;
  categoria: string;
  imagenUrl: string | null;
};

type StoreCartContextValue = {
  items: StoreCartItem[];
  totalItems: number;
  subtotal: number;
  addItem: (payload: AddCartItemPayload) => void;
  removeItem: (productId: number) => void;
  setItemQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
};

const StoreCartContext = createContext<StoreCartContextValue | null>(null);

export function StoreCartProvider({
  slug,
  children,
}: {
  slug: string;
  children: ReactNode;
}) {
  const [items, setItems] = useState<StoreCartItem[]>([]);
  const [loadedSlug, setLoadedSlug] = useState<string | null>(null);

  useEffect(() => {
    setItems(readStoreCart(slug));
    setLoadedSlug(slug);
  }, [slug]);

  useEffect(() => {
    if (loadedSlug !== slug) {
      return;
    }

    writeStoreCart(slug, items);
  }, [items, loadedSlug, slug]);

  const addItem = useCallback((payload: AddCartItemPayload) => {
    setItems((currentItems) => {
      const existing = currentItems.find(
        (item) => item.productId === payload.productId,
      );

      if (!existing) {
        return [
          ...currentItems,
          {
            productId: payload.productId,
            nombre: payload.nombre,
            precio: payload.precio,
            cantidad: Math.max(1, Math.min(payload.cantidad, payload.cantidadDisponible)),
            cantidadDisponible: payload.cantidadDisponible,
            categoria: payload.categoria,
            imagenUrl: payload.imagenUrl,
          },
        ];
      }

      return currentItems.map((item) =>
        item.productId === payload.productId
          ? {
              ...item,
              cantidad: Math.min(
                item.cantidad + Math.max(1, payload.cantidad),
                item.cantidadDisponible,
              ),
            }
          : item,
      );
    });
  }, []);

  const setItemQuantity = useCallback((productId: number, quantity: number) => {
    setItems((currentItems) =>
      currentItems
        .map((item) =>
          item.productId === productId
            ? {
                ...item,
                cantidad: Math.max(1, Math.min(quantity, item.cantidadDisponible)),
              }
            : item,
        )
        .filter((item) => item.cantidad > 0),
    );
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.productId !== productId),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = useMemo(
    () => items.reduce((total, item) => total + item.cantidad, 0),
    [items],
  );

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.precio * item.cantidad, 0),
    [items],
  );

  const value = useMemo<StoreCartContextValue>(
    () => ({
      items,
      totalItems,
      subtotal,
      addItem,
      removeItem,
      setItemQuantity,
      clearCart,
    }),
    [addItem, clearCart, items, removeItem, setItemQuantity, subtotal, totalItems],
  );

  return (
    <StoreCartContext.Provider value={value}>{children}</StoreCartContext.Provider>
  );
}

export function useStoreCart() {
  const context = useContext(StoreCartContext);

  if (!context) {
    throw new Error("useStoreCart debe usarse dentro de StoreCartProvider.");
  }

  return context;
}
