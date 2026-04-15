"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

import {
  fetchCurrentUser,
  hasPermission,
  type CurrentUser,
} from "@/modules/auth/services/current-user-service";
import {
  getAccessToken,
  getSessionCacheStatus,
  clearAccessToken,
  setSessionCacheStatus,
} from "@/modules/auth/lib/session";
import { ensureSession } from "@/modules/auth/services/session-service";
import { logoutService } from "@/modules/auth/services/logout-service";
import type { TiendaDisponible } from "@/modules/tiendas/types/tiendas-types";

type AdminSessionContextValue = {
  currentUser: CurrentUser | null;
  isLoading: boolean;
  error: string | null;
  stores: TiendaDisponible[];
  activeStoreId: number | null;
  activeStore: TiendaDisponible | null;
  setActiveStoreId: (storeId: number | null) => void;
  hasPermission: (permission: string) => boolean;
  refreshCurrentUser: () => Promise<void>;
  logout: () => Promise<void>;
};

const ACTIVE_STORE_STORAGE_KEY = "insoshop.active-store-id";
const CURRENT_USER_STORAGE_KEY = "insoshop.current-user";

const AdminSessionContext = createContext<AdminSessionContextValue | null>(null);

function getStoredActiveStoreId() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedValue = window.localStorage.getItem(ACTIVE_STORE_STORAGE_KEY);
  if (!storedValue) {
    return null;
  }

  const parsedValue = Number(storedValue);
  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : null;
}

function getStoredCurrentUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedValue = window.localStorage.getItem(CURRENT_USER_STORAGE_KEY);
  if (!storedValue) {
    return null;
  }

  try {
    return JSON.parse(storedValue) as CurrentUser;
  } catch {
    window.localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    return null;
  }
}

function resolveActiveStoreId(user: CurrentUser, preferredStoreId: number | null) {
  const preferredIds = [preferredStoreId, getStoredActiveStoreId(), user.tiendaPrincipalId];

  for (const preferredId of preferredIds) {
    if (
      preferredId &&
      user.tiendas.some((store) => store.id === preferredId)
    ) {
      return preferredId;
    }
  }

  return user.tiendas[0]?.id ?? null;
}

export function AdminSessionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() =>
    getStoredCurrentUser()
  );
  const [isLoading, setIsLoading] = useState(() => getStoredCurrentUser() === null);
  const [error, setError] = useState<string | null>(null);
  const [activeStoreId, setActiveStoreIdState] = useState<number | null>(null);
  const currentUserRef = useRef<CurrentUser | null>(currentUser);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  const refreshCurrentUser = useCallback(async () => {
    if (!currentUserRef.current) {
      setIsLoading(true);
    }

    setError(null);

    try {
      const hasAuthenticatedSession =
        getSessionCacheStatus() === "authenticated" && Boolean(getAccessToken())
          ? true
          : await ensureSession();

      if (!hasAuthenticatedSession) {
        clearAccessToken();
        setSessionCacheStatus("unauthenticated");
        setCurrentUser(null);
        setActiveStoreIdState(null);
        return;
      }

      const user = await fetchCurrentUser();
      setCurrentUser(user);
      setActiveStoreIdState((currentStoreId) =>
        resolveActiveStoreId(user, currentStoreId)
      );
    } catch (loadError) {
      clearAccessToken();
      setSessionCacheStatus("unauthenticated");
      setCurrentUser(null);
      setActiveStoreIdState(null);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudo cargar el contexto del usuario."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await logoutService();
    clearAccessToken();
    setCurrentUser(null);
    setActiveStoreIdState(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (pathname.startsWith("/auth")) {
      setIsLoading(false);
      return;
    }

    void refreshCurrentUser();
  }, [pathname, refreshCurrentUser]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (activeStoreId) {
      window.localStorage.setItem(
        ACTIVE_STORE_STORAGE_KEY,
        String(activeStoreId)
      );
      return;
    }

    window.localStorage.removeItem(ACTIVE_STORE_STORAGE_KEY);
  }, [activeStoreId]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (currentUser) {
      window.localStorage.setItem(
        CURRENT_USER_STORAGE_KEY,
        JSON.stringify(currentUser)
      );
      return;
    }

    window.localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  }, [currentUser]);

  const stores = useMemo(() => currentUser?.tiendas ?? [], [currentUser]);
  const activeStore =
    stores.find((store) => store.id === activeStoreId) ?? null;

  const value = useMemo<AdminSessionContextValue>(
    () => ({
      currentUser,
      isLoading,
      error,
      stores,
      activeStoreId,
      activeStore,
      setActiveStoreId: (storeId) => {
        if (!storeId) {
          setActiveStoreIdState(null);
          return;
        }

        if (!stores.some((store) => store.id === storeId)) {
          return;
        }

        setActiveStoreIdState(storeId);
      },
      hasPermission: (permission) => hasPermission(currentUser, permission),
      refreshCurrentUser,
      logout,
    }),
    [
      activeStore,
      activeStoreId,
      currentUser,
      error,
      isLoading,
      logout,
      refreshCurrentUser,
      stores,
    ]
  );

  return (
    <AdminSessionContext.Provider value={value}>
      {children}
    </AdminSessionContext.Provider>
  );
}

export function useAdminSession() {
  const context = useContext(AdminSessionContext);

  if (!context) {
    throw new Error("useAdminSession debe usarse dentro de AdminSessionProvider.");
  }

  return context;
}
