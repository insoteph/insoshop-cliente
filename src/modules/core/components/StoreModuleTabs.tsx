"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type StoreModuleTabId =
  | "informacion"
  | "productos"
  | "categorias"
  | "ventas";

const TAB_LABELS: Record<StoreModuleTabId, string> = {
  informacion: "Informacion",
  productos: "Productos",
  categorias: "Categorias",
  ventas: "Ventas",
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
      className={`app-card relative flex flex-wrap gap-0 overflow-x-auto rounded-2xl p-0 ${className ?? ""}`}
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
          className={`border-r border-[var(--line)] px-4 py-3 text-sm text-[var(--foreground)] transition last:border-r-0 ${
            activeTab === tabId
              ? "bg-[var(--accent-soft)] text-[var(--foreground-strong)]"
              : "bg-transparent text-[var(--muted)] hover:bg-[var(--panel-muted)] hover:text-[var(--foreground)]"
          }`}
        >
          {TAB_LABELS[tabId]}
        </button>
      ))}
    </div>
  );
}
