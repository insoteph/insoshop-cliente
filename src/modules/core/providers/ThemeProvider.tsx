"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const STORAGE_KEY = "insoshop.theme";
const ADMIN_ROUTE_ROOTS = new Set([
  "auth",
  "dashboard",
  "roles",
  "usuarios",
  "ventas",
  "tiendas",
]);

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    const storedTheme = window.localStorage.getItem(STORAGE_KEY);
    if (storedTheme === "dark" || storedTheme === "light") {
      return storedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  const isForcedLightRoute = useMemo(() => {
    const segments = pathname?.split("/").filter(Boolean) ?? [];

    if (segments.length === 0) {
      return false;
    }

    if (segments[0] === "store") {
      return (
        segments.length === 2 ||
        (segments.length === 3 && segments[2] === "carrito") ||
        (segments.length === 4 && segments[2] === "productos")
      );
    }

    if (ADMIN_ROUTE_ROOTS.has(segments[0])) {
      return false;
    }

    return (
      segments.length === 1 ||
      (segments.length === 2 && segments[1] === "carrito") ||
      (segments.length === 3 && segments[1] === "productos")
    );
  }, [pathname]);

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      !isForcedLightRoute && theme === "dark"
    );

    if (!isForcedLightRoute) {
      window.localStorage.setItem(STORAGE_KEY, theme);
    }
  }, [isForcedLightRoute, theme]);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () =>
        setTheme((currentTheme) =>
          currentTheme === "dark" ? "light" : "dark"
        ),
    }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme debe usarse dentro de ThemeProvider.");
  }

  return context;
}
