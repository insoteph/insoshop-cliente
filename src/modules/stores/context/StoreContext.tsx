"use client";

import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  fetchAvailableStores,
  fetchOperativeStore,
  type StoreOption,
} from "@/modules/stores/services/store-service";
import { getAccessToken } from "@/modules/auth/lib/session";

type StoreContextValue = {
  stores: StoreOption[];
  activeStoreId: number | null;
  activeStore: StoreOption | null;
  isLoading: boolean;
  error: string | null;
  setActiveStoreId: (storeId: number) => void;
  refreshStores: () => Promise<void>;
};

const STORAGE_KEY = "insoshop.active-store-id";

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [activeStoreId, setActiveStoreIdState] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshStores = useCallback(async () => {
    if (!getAccessToken()) {
      setStores([]);
      setActiveStoreIdState(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [availableStores, operativeStore] = await Promise.all([
        fetchAvailableStores(),
        fetchOperativeStore(),
      ]);

      const persistedStoreId =
        typeof window !== "undefined"
          ? Number(window.localStorage.getItem(STORAGE_KEY))
          : NaN;

      const nextActiveStoreId = availableStores.some(
        (store) => store.id === persistedStoreId
      )
        ? persistedStoreId
        : operativeStore.id;

      setStores(availableStores);
      setActiveStoreIdState(nextActiveStoreId);
    } catch (refreshError) {
      setError(
        refreshError instanceof Error
          ? refreshError.message
          : "No se pudieron cargar las tiendas del usuario."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshStores();
  }, [refreshStores]);

  useEffect(() => {
    if (typeof window === "undefined" || !activeStoreId) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, String(activeStoreId));
  }, [activeStoreId]);

  const value = useMemo(
    () => ({
      stores,
      activeStoreId,
      activeStore:
        stores.find((store) => store.id === activeStoreId) || null,
      isLoading,
      error,
      setActiveStoreId: (storeId: number) => setActiveStoreIdState(storeId),
      refreshStores,
    }),
    [stores, activeStoreId, isLoading, error, refreshStores]
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStoreContext() {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error("useStoreContext debe usarse dentro de StoreProvider.");
  }

  return context;
}
