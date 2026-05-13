"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type StoreModuleTabId =
  | "informacion"
  | "apariencia"
  | "productos"
  | "categorias"
  | "ventas"
  | "usuarios"
  | "configuraciones";

const TAB_LABELS: Record<StoreModuleTabId, string> = {
  informacion: "Informacion",
  apariencia: "Apariencia",
  productos: "Productos",
  categorias: "Categorias",
  ventas: "Ventas",
  usuarios: "Usuarios",
  configuraciones: "Configuraciones",
};

const TAB_ICONS: Record<StoreModuleTabId, string> = {
  informacion: "/icons/shop.svg",
  apariencia: "/icons/img.svg",
  productos: "/icons/box.svg",
  categorias: "/icons/filter.svg",
  ventas: "/icons/cart.svg",
  usuarios: "/icons/users.svg",
  configuraciones: "/icons/shield.svg",
};

type StoreModuleTabsProps = {
  visibleTabs: StoreModuleTabId[];
  activeTab: StoreModuleTabId;
  onTabChange: (tab: StoreModuleTabId) => void;
  className?: string;
};

export function StoreModuleTabs({
  visibleTabs,
  activeTab,
  onTabChange,
  className,
}: StoreModuleTabsProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<
    Partial<Record<StoreModuleTabId, HTMLButtonElement | null>>
  >({});
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  const updateIndicator = useCallback(() => {
    const activeButton = tabRefs.current[activeTab];
    const container = containerRef.current;

    if (!activeButton || !container) {
      return;
    }

    const activeRect = activeButton.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    setIndicatorStyle({
      left: activeRect.left - containerRect.left + container.scrollLeft,
      width: activeRect.width,
      opacity: 1,
    });
  }, [activeTab]);

  useEffect(() => {
    updateIndicator();
  }, [updateIndicator, visibleTabs]);

  useEffect(() => {
    window.addEventListener("resize", updateIndicator);

    return () => {
      window.removeEventListener("resize", updateIndicator);
    };
  }, [updateIndicator]);

  return (
    <div
      ref={containerRef}
      onScroll={updateIndicator}
      className={`relative flex flex-nowrap gap-0 overflow-x-auto scroll-smooth rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-0 shadow-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${className ?? ""}`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 z-10 h-[2px] bg-[var(--accent)] transition-all duration-300 ease-out"
        style={{
          width: `${indicatorStyle.width}px`,
          transform: `translateX(${indicatorStyle.left}px)`,
          opacity: indicatorStyle.opacity,
          boxShadow: "0 0 10px color-mix(in srgb, var(--accent) 72%, transparent)",
        }}
      />

      {visibleTabs.map((tabId) => (
        <button
          key={tabId}
          type="button"
          ref={(element) => {
            tabRefs.current[tabId] = element;
          }}
          onClick={() => onTabChange(tabId)}
          className={`group flex min-h-[4.1rem] shrink-0 snap-start flex-col items-center justify-center gap-1 px-4 py-3.5 text-center font-normal transition sm:min-w-[7rem] ${
            activeTab === tabId
              ? "bg-[var(--panel-strong)] text-[var(--accent)]"
              : "bg-[var(--panel)] text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          <span
            aria-hidden="true"
            className="h-[18px] w-[18px] bg-current"
            style={{
              WebkitMaskImage: `url(${TAB_ICONS[tabId]})`,
              maskImage: `url(${TAB_ICONS[tabId]})`,
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskPosition: "center",
              WebkitMaskSize: "contain",
              maskSize: "contain",
            }}
          />
          <span className="text-[11px] font-normal leading-none sm:text-xs">
            {TAB_LABELS[tabId]}
          </span>
        </button>
      ))}
    </div>
  );
}
