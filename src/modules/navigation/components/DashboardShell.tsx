"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

import {
  fetchCurrentUser,
  type CurrentUser,
} from "@/modules/auth/services/current-user-service";
import { Sidebar } from "@/modules/navigation/components/Sidebar";
import { useTheme } from "@/modules/core/providers/ThemeProvider";

export function DashboardShell({ children }: { children: ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    fetchCurrentUser()
      .then((user) => setCurrentUser(user))
      .catch(() => setCurrentUser(null));
  }, []);

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
              title={isSidebarCollapsed ? "Expandir menú" : "Contraer menú"}
              aria-label={
                isSidebarCollapsed ? "Expandir menú" : "Contraer menú"
              }
            >
              <span />
              <span />
              <span />
            </button>
          </div>

          <div className="dashboard-topbar-actions">
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

            <div className="dashboard-user-card">
              <div className="dashboard-user-avatar">{initials}</div>
              <div className="dashboard-user-copy">
                <p className="dashboard-user-name">
                  {currentUser?.nombre || "Usuario"}
                </p>
                <p className="dashboard-user-role">
                  {currentUser?.rolName || "Autenticación pendiente"}
                </p>
              </div>
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
