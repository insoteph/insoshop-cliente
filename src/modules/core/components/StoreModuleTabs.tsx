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
  return (
    <div
      className={`flex flex-wrap gap-0 overflow-x-auto rounded-md border border-[var(--line)] bg-[var(--panel)] p-0 shadow-lg ${className ?? ""}`}
    >
      {visibleTabs.map((tabId) => (
        <button
          key={tabId}
          type="button"
          onClick={() => onTabChange(tabId)}
          className={`border-r border-[var(--line)] px-4 py-3 text-sm font-semibold text-slate-700 transition last:border-r-0 ${
            activeTab === tabId
              ? "bg-blue-100/70 text-slate-900 shadow-[inset_0_-3px_0_0_rgba(37,99,235,1),inset_0_-12px_12px_-10px_rgba(59,130,246,0.9)]"
              : "bg-slate-100 text-slate-700 hover:bg-slate-300"
          }`}
        >
          {TAB_LABELS[tabId]}
        </button>
      ))}
    </div>
  );
}
