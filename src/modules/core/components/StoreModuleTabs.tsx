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
      className={`relative flex flex-wrap gap-0 overflow-x-auto rounded-md border border-[var(--line)] bg-[var(--panel)] p-0 shadow-lg ${className ?? ""}`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 z-10 h-[2px] bg-blue-600 shadow-[0_0_6px_rgba(37,99,235,0.75)] transition-all duration-300 ease-out"
        style={{
          width: `${indicatorStyle.width}px`,
          transform: `translateX(${indicatorStyle.left}px)`,
          opacity: indicatorStyle.opacity,
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
          className={`border-r border-[var(--line)] px-4 py-3 text-sm  text-slate-700 transition last:border-r-0 ${
            activeTab === tabId
              ? "bg-blue-100/70 text-slate-900"
              : "bg-slate-100 text-slate-700 hover:bg-slate-300"
          }`}
        >
          {TAB_LABELS[tabId]}
        </button>
      ))}
    </div>
  );
}
