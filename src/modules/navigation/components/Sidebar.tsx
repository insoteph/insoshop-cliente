"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

import { SidebarItem } from "@/modules/navigation/components/SidebarItem";
import { StoreSelector } from "@/modules/stores/components/StoreSelector";
import type { StoreOption } from "@/modules/stores/services/store-service";

type SidebarProps = {
  stores: StoreOption[];
  activeStoreId: number | null;
  isStoreLoading: boolean;
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onStoreChange: (storeId: number) => void;
};

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: "◫" },
  { href: "/dashboard/tiendas", label: "Tiendas", icon: "⌂" },
  { href: "/dashboard/productos", label: "Productos", icon: "◩" },
  { href: "/dashboard/categorias", label: "Categorías", icon: "◧" },
  { href: "/dashboard/ventas", label: "Ventas", icon: "◪" },
];

export function Sidebar({
  stores,
  activeStoreId,
  isStoreLoading,
  isOpen,
  isCollapsed,
  onClose,
  onStoreChange,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={`sidebar-backdrop ${isOpen ? "sidebar-backdrop-visible" : ""}`}
        onClick={onClose}
      />

      <aside
        className={`sidebar-shell ${isOpen ? "sidebar-shell-open" : ""} ${isCollapsed ? "sidebar-shell-collapsed" : ""}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[var(--accent-soft)] p-2">
              <Image
                src="/assets/logo.png"
                alt="InsoShop"
                width={36}
                height={36}
                className="h-9 w-9 object-contain"
              />
            </div>
            <div className={isCollapsed ? "sidebar-brand-hidden" : ""}>
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
                Panel
              </p>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                InsoShop
              </h2>
            </div>
          </div>

          <button className="sidebar-close" onClick={onClose} type="button">
            ✕
          </button>
        </div>

        <div className="mt-8">
          <SidebarItem
            href="/dashboard"
            label="Dashboard"
            icon={<span>▥</span>}
            active={pathname === "/dashboard"}
            collapsed={isCollapsed}
            onClick={onClose}
          />
        </div>

        <div className="mt-6">
          <p
            className={`px-3 text-xs uppercase tracking-[0.2em] text-[var(--muted)] ${isCollapsed ? "sidebar-section-hidden" : ""}`}
          >
            Módulo InsoShop
          </p>
          <nav className="mt-3 space-y-1">
            {navigation.slice(1).map((item) => (
              <SidebarItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={<span>{item.icon}</span>}
                active={pathname === item.href}
                collapsed={isCollapsed}
                onClick={onClose}
              />
            ))}
          </nav>
        </div>

        <div className={`mt-8 ${isCollapsed ? "sidebar-store-hidden" : ""}`}>
          <StoreSelector
            stores={stores}
            activeStoreId={activeStoreId}
            isLoading={isStoreLoading}
            onChange={onStoreChange}
          />
        </div>
      </aside>
    </>
  );
}
