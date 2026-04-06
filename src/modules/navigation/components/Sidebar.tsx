"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

import { permissions } from "@/modules/auth/lib/permissions";
import { useAdminSession } from "@/modules/auth/providers/AdminSessionProvider";
import { SidebarItem } from "@/modules/navigation/components/SidebarItem";

type SidebarProps = {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
};

export function Sidebar({ isOpen, isCollapsed, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { currentUser, activeStore, hasPermission } = useAdminSession();

  const canSeeStoreAdmin =
    hasPermission(permissions.tiendas.ver) ||
    hasPermission(permissions.productos.ver) ||
    hasPermission(permissions.categorias.ver) ||
    hasPermission(permissions.ventas.ver) ||
    hasPermission(permissions.usuarios.ver);
  const canSeeUsers = hasPermission(permissions.usuarios.ver);
  const canSeeRoles = hasPermission(permissions.roles.ver);
  const canSeeSales =
    currentUser?.tieneAccesoGlobal || hasPermission(permissions.ventas.ver);

  const dashboardHref = currentUser?.tieneAccesoGlobal
    ? "/tiendas"
    : activeStore
      ? `/tiendas/${activeStore.id}`
      : "/dashboard";

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
                className="h-8 w-8 object-contain"
              />
            </div>
            <div className={isCollapsed ? "sidebar-brand-hidden" : ""}>
              <p className="text-md font-medium uppercase tracking-[0.24em] text-[var(--muted)]">
                Panel
              </p>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                InsoShop
              </h2>
            </div>
          </div>

          <button className="sidebar-close" onClick={onClose} type="button">
            X
          </button>
        </div>

        <div className="mt-8">
          <SidebarItem
            href={dashboardHref}
            label="Inicio"
            icon="/icons/dashboard.svg"
            active={
              pathname === "/dashboard" ||
              pathname === dashboardHref ||
              pathname.startsWith("/tiendas/")
            }
            collapsed={isCollapsed}
            onClick={onClose}
          />
        </div>

        <div className="mt-1">
          <p
            className={`px-3 text-xs uppercase tracking-[0.2em] text-[var(--muted)] ${isCollapsed ? "sidebar-section-hidden" : ""}`}
          >
            Modulos InsoShop
          </p>
          <nav className="mt-1 space-y-1">
            {canSeeStoreAdmin ? (
              <SidebarItem
                href={dashboardHref}
                label={currentUser?.tieneAccesoGlobal ? "Tiendas" : "Mi tienda"}
                icon="/icons/Cart.svg"
                active={pathname === "/tiendas" || pathname.startsWith("/tiendas/")}
                collapsed={isCollapsed}
                onClick={onClose}
              />
            ) : null}

            {canSeeSales ? (
              <SidebarItem
                href="/ventas"
                label="Ventas"
                icon="/icons/dashboard.svg"
                active={pathname === "/ventas"}
                collapsed={isCollapsed}
                onClick={onClose}
              />
            ) : null}

            {canSeeUsers ? (
              <SidebarItem
                href="/usuarios"
                label="Usuarios"
                icon="/icons/users.svg"
                active={pathname === "/usuarios"}
                collapsed={isCollapsed}
                onClick={onClose}
              />
            ) : null}

            {canSeeRoles ? (
              <SidebarItem
                href="/roles"
                label="Roles"
                icon="/icons/shield.svg"
                active={pathname === "/roles"}
                collapsed={isCollapsed}
                onClick={onClose}
              />
            ) : null}
          </nav>
        </div>
      </aside>
    </>
  );
}
