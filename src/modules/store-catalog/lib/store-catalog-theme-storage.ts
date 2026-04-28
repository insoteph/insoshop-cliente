export type StoreCatalogTheme = "light" | "dark";

const THEME_KEY = "insoshop.store-catalog.theme";

export function readStoreCatalogTheme(): StoreCatalogTheme {
  if (typeof window === "undefined") {
    return "light";
  }

  const raw = window.localStorage.getItem(THEME_KEY);
  if (raw === "dark" || raw === "light") {
    return raw;
  }

  return "light";
}

export function writeStoreCatalogTheme(theme: StoreCatalogTheme) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(THEME_KEY, theme);
}
