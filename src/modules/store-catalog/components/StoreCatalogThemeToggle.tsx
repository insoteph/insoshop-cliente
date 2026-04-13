"use client";

import type { StoreCatalogTheme } from "@/modules/store-catalog/lib/store-catalog-theme-storage";

type StoreCatalogThemeToggleProps = {
  theme: StoreCatalogTheme;
  onToggle: () => void;
  className?: string;
};

export function StoreCatalogThemeToggle({
  theme,
  onToggle,
  className,
}: StoreCatalogThemeToggleProps) {
  const isDark = theme === "dark";
  const iconPath = isDark ? "/icons/sunny.svg" : "/icons/moon.svg";

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--panel-strong)] text-sm font-semibold text-[var(--foreground)] shadow-[var(--shadow)] hover:border-[var(--line-strong)] ${className ?? ""}`}
      aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
    >
      <span
        aria-hidden="true"
        className={`h-5 w-5 ${isDark ? "text-[#fbbf24]" : "text-[#6d38ff]"}`}
        style={{
          WebkitMaskImage: `url(${iconPath})`,
          maskImage: `url(${iconPath})`,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          WebkitMaskSize: "contain",
          maskSize: "contain",
          backgroundColor: "currentColor",
        }}
      />
    </button>
  );
}
