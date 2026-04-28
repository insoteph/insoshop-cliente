"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAdminSession } from "@/modules/auth/providers/AdminSessionProvider";
import { ProcessingModal } from "@/modules/core/components/ProcessingModal";
import { useTheme } from "@/modules/core/providers/ThemeProvider";
import { Sidebar } from "@/modules/navigation/components/Sidebar";

type DashboardShellProps = {
  children: ReactNode;
  pageTitle: string;
};

export function DashboardShell({ children, pageTitle }: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const {
    currentUser,
    isLoading,
    stores,
    activeStoreId,
    setActiveStoreId,
    logout,
  } = useAdminSession();

  const initials = useMemo(() => {
    if (!currentUser?.nombre) {
      return "IS";
    }

    return currentUser.nombre
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((chunk) => chunk[0]?.toUpperCase() ?? "")
      .join("");
  }, [currentUser]);

  function handleSidebarToggle() {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsSidebarOpen(true);
      return;
    }

    setIsSidebarCollapsed((currentValue) => !currentValue);
  }

  function handleStoreChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextStoreId = Number(event.target.value);
    if (!Number.isInteger(nextStoreId) || nextStoreId <= 0) {
      return;
    }

    setActiveStoreId(nextStoreId);
    router.push(`/tiendas/${nextStoreId}`);
  }

  const canReturnToDirectory =
    currentUser?.tieneAccesoGlobal && pathname !== "/tiendas";

  useEffect(() => {
    if (!isUserMenuOpen) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  if (isLoading && !currentUser) {
    return <ProcessingModal isOpen label="Cargando panel..." />;
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    setLogoutError(null);

    try {
      await logout();
      setIsUserMenuOpen(false);
      router.replace("/auth/login");
      router.refresh();
    } catch (error) {
      setLogoutError(
        error instanceof Error
          ? error.message
          : "No se pudo cerrar la sesión."
      );
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="dashboard-root">
      <Sidebar
        isOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="dashboard-content">
        <header className="dashboard-topbar">
          <div className="dashboard-topbar-main">
            <button
              type="button"
              className="sidebar-hamburger topbar-hamburger"
              onClick={handleSidebarToggle}
              title={isSidebarCollapsed ? "Expandir menu" : "Contraer menu"}
              aria-label={isSidebarCollapsed ? "Expandir menu" : "Contraer menu"}
            >
              <span className="sidebar-hamburger-icon" aria-hidden="true" />
            </button>

            <div className="dashboard-heading">
              <h1 className="dashboard-heading-title">{pageTitle}</h1>
            </div>
          </div>
          <div className="dashboard-topbar-actions">
            {!currentUser?.tieneAccesoGlobal && stores.length > 1 ? (
              <select
                id="active-store"
                className="topbar-store-select"
                value={activeStoreId ?? ""}
                onChange={handleStoreChange}
              >
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.nombre}
                  </option>
                ))}
              </select>
            ) : null}

            {canReturnToDirectory ? (
              <button
                type="button"
                className="topbar-ghost-button"
                onClick={() => router.push("/tiendas")}
              >
                Ver listado
              </button>
            ) : null}

            <button
              type="button"
              onClick={toggleTheme}
              className="topbar-icon-button"
              title={
                theme === "dark"
                  ? "Cambiar a modo claro"
                  : "Cambiar a modo oscuro"
              }
              aria-label={
                theme === "dark"
                  ? "Cambiar a modo claro"
                  : "Cambiar a modo oscuro"
              }
            >
              <span className="text-lg leading-none">
                {theme === "dark" ? "☀" : "☾"}
              </span>
            </button>

            <div className="dashboard-user-menu" ref={userMenuRef}>
              <button
                type="button"
                className="dashboard-user-card dashboard-user-trigger"
                onClick={() => {
                  setLogoutError(null);
                  setIsUserMenuOpen((currentValue) => !currentValue);
                }}
                title="Opciones de usuario"
                aria-label="Opciones de usuario"
                aria-haspopup="menu"
                aria-expanded={isUserMenuOpen}
              >
                <div className="dashboard-user-avatar">{initials}</div>
                <div className="dashboard-user-copy">
                  <p className="dashboard-user-name">
                    {currentUser?.nombre || "Usuario"}
                  </p>
                  <p className="dashboard-user-role">
                    {currentUser?.rolName || "Autenticacion pendiente"}
                  </p>
                </div>
              </button>

              {isUserMenuOpen ? (
                <div className="dashboard-user-dropdown" role="menu">
                  <button
                    type="button"
                    className="dashboard-user-dropdown-item"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    role="menuitem"
                  >
                    {isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
                  </button>

                  {logoutError ? (
                    <p className="dashboard-user-dropdown-error">{logoutError}</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <div className="dashboard-body">
          <main className="dashboard-main">{children}</main>
        </div>
      </div>
    </div>
  );
}
