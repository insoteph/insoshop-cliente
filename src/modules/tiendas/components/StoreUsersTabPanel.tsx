"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AppButton } from "@/modules/core/components/AppButton";
import {
  DataTable,
  type DataTableBadgeConfig,
  type DataTableColumn,
} from "@/modules/core/components/DataTable";
import { PanelSectionHeader } from "@/modules/core/components/PanelSectionHeader";
import { SearchBar } from "@/modules/core/components/SearchBar";
import { useConfirmationDialog } from "@/modules/core/providers/ConfirmationDialogProvider";
import { fetchUsers } from "@/modules/users/services/user-service";
import type { UserRecord } from "@/modules/users/types/users-types";
import { toggleUserStatus } from "@/modules/users/services/user-service";
import {
  assignUsuarioTienda,
  fetchTiendaUsuarios,
  unassignUsuarioTienda,
} from "@/modules/tiendas/services/tiendas-service";
import type { TiendaUsuario } from "@/modules/tiendas/types/tiendas-types";

type StoreUsersTabPanelProps = {
  storeId: number;
};

const FORM_ANIMATION_MS = 400;

export function StoreUsersTabPanel({ storeId }: StoreUsersTabPanelProps) {
  const { confirm } = useConfirmationDialog();
  const [users, setUsers] = useState<TiendaUsuario[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAssignPanelMounted, setIsAssignPanelMounted] = useState(false);
  const [isAssignPanelVisible, setIsAssignPanelVisible] = useState(false);
  const closeAssignPanelTimeoutRef = useRef<number | null>(null);

  const [availableUsers, setAvailableUsers] = useState<UserRecord[]>([]);
  const [assignPage, setAssignPage] = useState(1);
  const [assignPageSize] = useState(8);
  const [assignTotalPages, setAssignTotalPages] = useState(1);
  const [assignTotalRecords, setAssignTotalRecords] = useState(0);
  const [assignSearch, setAssignSearch] = useState("");
  const [isAssignLoading, setIsAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchTiendaUsuarios(storeId, {
        page,
        pageSize,
        search,
        estadoFiltro: "todos",
      });

      setUsers(result.items);
      setTotalPages(result.totalPages);
      setTotalRecords(result.totalRecords);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudieron cargar los usuarios de la tienda.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search, storeId]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const clearCloseAssignPanelTimeout = useCallback(() => {
    if (closeAssignPanelTimeoutRef.current) {
      window.clearTimeout(closeAssignPanelTimeoutRef.current);
      closeAssignPanelTimeoutRef.current = null;
    }
  }, []);

  const openAssignPanel = useCallback(() => {
    clearCloseAssignPanelTimeout();
    setIsAssignPanelMounted(true);
    window.requestAnimationFrame(() => {
      setIsAssignPanelVisible(true);
    });
  }, [clearCloseAssignPanelTimeout]);

  const closeAssignPanel = useCallback(() => {
    setIsAssignPanelVisible(false);
    clearCloseAssignPanelTimeout();
    closeAssignPanelTimeoutRef.current = window.setTimeout(() => {
      setIsAssignPanelMounted(false);
      setAssignError(null);
    }, FORM_ANIMATION_MS);
  }, [clearCloseAssignPanelTimeout]);

  useEffect(() => {
    return () => {
      clearCloseAssignPanelTimeout();
    };
  }, [clearCloseAssignPanelTimeout]);

  useEffect(() => {
    if (!isAssignPanelMounted) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeAssignPanel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeAssignPanel, isAssignPanelMounted]);

  const loadAvailableUsers = useCallback(async () => {
    if (!isAssignPanelMounted) {
      return;
    }

    setIsAssignLoading(true);
    setAssignError(null);

    try {
      const result = await fetchUsers({
        page: assignPage,
        pageSize: assignPageSize,
        search: assignSearch,
        estadoFiltro: "todos",
      });

      setAvailableUsers(result.items);
      setAssignTotalPages(result.totalPages);
      setAssignTotalRecords(result.totalRecords);
    } catch (loadError) {
      setAssignError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudieron cargar los usuarios disponibles.",
      );
    } finally {
      setIsAssignLoading(false);
    }
  }, [assignPage, assignPageSize, assignSearch, isAssignPanelMounted]);

  const waitForAssignPanelClose = useCallback(() => {
    return new Promise<void>((resolve) => {
      window.setTimeout(() => resolve(), FORM_ANIMATION_MS);
    });
  }, []);

  useEffect(() => {
    void loadAvailableUsers();
  }, [loadAvailableUsers]);

  const handleAssignUser = useCallback(
    async (user: TiendaUsuario) => {
      const shouldContinue = await confirm({
        title: "Asignar usuario",
        description: `Deseas asignar a ${user.username} a esta tienda?`,
        confirmLabel: "Asignar",
      });
      if (!shouldContinue) {
        return;
      }

      try {
        await assignUsuarioTienda(storeId, user.usuarioId);
        await loadUsers();
        await loadAvailableUsers();
      } catch (assignError) {
        setError(
          assignError instanceof Error
            ? assignError.message
            : "No se pudo asignar el usuario a la tienda.",
        );
      }
    },
    [confirm, loadAvailableUsers, loadUsers, storeId],
  );

  const handleUnassignUser = useCallback(
    async (user: TiendaUsuario) => {
      const shouldContinue = await confirm({
        title: "Desasignar usuario",
        description: `Deseas desasignar a ${user.username} de esta tienda?`,
        confirmLabel: "Desasignar",
        variant: "danger",
      });
      if (!shouldContinue) {
        return;
      }

      try {
        await unassignUsuarioTienda(storeId, user.usuarioId);
        await loadUsers();
      } catch (unassignError) {
        setError(
          unassignError instanceof Error
            ? unassignError.message
            : "No se pudo desasignar el usuario de la tienda.",
        );
      }
    },
    [confirm, loadUsers, storeId],
  );

  const handleToggleUserStatus = useCallback(
    async (user: TiendaUsuario) => {
      const action = user.estado ? "inactivar" : "activar";
      const shouldContinue = await confirm({
        title: "Confirmar accion",
        description: `Deseas ${action} este usuario?`,
        confirmLabel: user.estado ? "Inactivar" : "Activar",
        variant: user.estado ? "danger" : "primary",
      });
      if (!shouldContinue) {
        return;
      }

      try {
        await toggleUserStatus(user.usuarioId, storeId);
        await loadUsers();
      } catch (toggleError) {
        setError(
          toggleError instanceof Error
            ? toggleError.message
            : "No se pudo actualizar el estado del usuario.",
        );
      }
    },
    [confirm, loadUsers, storeId],
  );

  const columns = useMemo<DataTableColumn<TiendaUsuario>[]>(
    () => [
      {
        key: "username",
        header: "Usuario",
        render: (user) => (
          <div className="space-y-1">
            <p className="font-semibold text-[var(--foreground)]">
              {user.detalleUsuario
                ? `${user.detalleUsuario.nombres} ${user.detalleUsuario.apellidos}`
                : user.username}
            </p>
            <p className="text-xs text-[var(--muted)]">@{user.username}</p>
          </div>
        ),
      },
      {
        key: "email",
        header: "Correo",
      },
      {
        key: "telefono",
        header: "Telefono",
        render: (user) => user.telefono || "-",
      },
      {
        key: "esPrincipal",
        header: "Principal",
      },
      {
        key: "estado",
        header: "Estado",
      },
    ],
    [],
  );

  const badges = useMemo<Array<DataTableBadgeConfig<TiendaUsuario>>>(
    () => [
      {
        columnKey: "esPrincipal",
        rules: [
          {
            value: true,
            label: "Si",
            iconPath: "/icons/check.svg",
            textClassName: "app-badge-success",
            backgroundClassName: "",
          },
          {
            value: false,
            label: "No",
            iconPath: "/icons/cross.svg",
            textClassName: "app-badge-neutral",
            backgroundClassName: "",
          },
        ],
      },
      {
        columnKey: "estado",
        rules: [
          {
            value: true,
            label: "Activo",
            iconPath: "/icons/check.svg",
            textClassName: "app-badge-success",
            backgroundClassName: "",
          },
          {
            value: false,
            label: "Inactivo",
            iconPath: "/icons/cross.svg",
            textClassName: "app-badge-neutral",
            backgroundClassName: "",
          },
        ],
      },
    ],
    [],
  );

  const rowActions = {
    primaryButtonLabel: "Desasignar",
    onPrimaryAction: handleUnassignUser,
    dropdownOptions: [
      {
        label: "Asignar",
        onClick: handleAssignUser,
      },
      {
        label: (user: TiendaUsuario) => (user.estado ? "Inactivar" : "Activar"),
        onClick: handleToggleUserStatus,
      },
    ],
  };

  const assignColumns = useMemo<DataTableColumn<UserRecord>[]>(
    () => [
      {
        key: "username",
        header: "Usuario",
        render: (user) => (
          <div className="space-y-1">
            <p className="font-semibold text-[var(--foreground)]">
              {user.detalleUsuario
                ? `${user.detalleUsuario.nombres} ${user.detalleUsuario.apellidos}`
                : user.username}
            </p>
            <p className="text-xs text-[var(--muted)]">@{user.username}</p>
          </div>
        ),
      },
      {
        key: "email",
        header: "Correo",
      },
      {
        key: "telefono",
        header: "Telefono",
        render: (user) => user.telefono || "-",
      },
      {
        key: "status",
        header: "Estado",
      },
    ],
    [],
  );

  const assignBadges = useMemo<Array<DataTableBadgeConfig<UserRecord>>>(
    () => [
      {
        columnKey: "status",
        rules: [
          {
            value: true,
            label: "Activo",
            iconPath: "/icons/check.svg",
            textClassName: "app-badge-success",
            backgroundClassName: "",
          },
          {
            value: false,
            label: "Inactivo",
            iconPath: "/icons/cross.svg",
            textClassName: "app-badge-neutral",
            backgroundClassName: "",
          },
        ],
      },
    ],
    [],
  );

  const assignRowActions = {
    primaryButtonLabel: "Asignar",
    onPrimaryAction: async (user: UserRecord) => {
      closeAssignPanel();
      await waitForAssignPanelClose();

      const shouldContinue = await confirm({
        title: "Asignar usuario",
        description: `Deseas asignar a ${user.username} a esta tienda?`,
        confirmLabel: "Asignar",
      });
      if (!shouldContinue) {
        return;
      }

      try {
        await assignUsuarioTienda(storeId, user.id);
        await loadUsers();
        await loadAvailableUsers();
      } catch (saveError) {
        setAssignError(
          saveError instanceof Error
            ? saveError.message
            : "No se pudo asignar el usuario a la tienda.",
        );
      }
    },
  };

  return (
    <section className="space-y-5">
      <div className="app-card overflow-hidden rounded-2xl shadow-[0_12px_30px_rgba(15,23,42,0.07)]">
        <div className="space-y-4 px-4 py-4 md:px-5 md:py-5">
          <PanelSectionHeader
            title="Usuarios de la tienda"
            subtitle="Administra los usuarios asociados, su estado y los accesos a esta tienda."
            headingLevel="h3"
          />

          <div className="flex flex-row items-center gap-2">
            <div className="min-w-0 flex-1">
              <SearchBar
                value={search}
                onChange={(value) => {
                  setPage(1);
                  setSearch(value);
                }}
                placeholder="Buscar por usuario, correo o telefono"
                ariaLabel="Buscar usuarios de tienda"
              />
            </div>
            <AppButton
              variant={isAssignPanelMounted ? "cancel" : "primary"}
              iconPath={isAssignPanelMounted ? "/icons/cross.svg" : "/icons/plus-circle.svg"}
              onClick={() => {
                if (isAssignPanelMounted) {
                  closeAssignPanel();
                  return;
                }
                openAssignPanel();
              }}
            >
              {isAssignPanelMounted ? "Cerrar formulario" : "Agregar usuario"}
            </AppButton>
          </div>

          {error ? (
            <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">{error}</p>
          ) : null}
        </div>

        <div className="border-t border-[var(--line)]" />

        <div className="px-0 pt-4">
          <DataTable
            headers={columns}
            data={users}
            isLoading={isLoading}
            rowKey="usuarioId"
            emptyMessage="No hay usuarios asociados a esta tienda."
            badges={badges}
            rowActions={rowActions}
            pagination={{
              page,
              totalPages,
              totalRecords,
              onPageChange: setPage,
            }}
          />
        </div>
      </div>

      {isAssignPanelMounted ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="assign-user-modal-title"
          className={`fixed inset-0 z-[200] flex items-center justify-center bg-black/60 px-3 py-3 transition-opacity duration-300 sm:px-4 sm:py-4 ${
            isAssignPanelVisible ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={closeAssignPanel}
        >
          <div
            className={`relative w-[min(96vw,72rem)] max-h-[min(78vh,48rem)] overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel)] text-[var(--foreground)] shadow-2xl opacity-100 transition-all duration-300 sm:rounded-2xl sm:border ${
              isAssignPanelVisible
                ? "translate-y-0 scale-100 opacity-100"
                : "translate-y-2 scale-[0.98] opacity-0"
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeAssignPanel}
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--danger)] bg-white text-[var(--danger)] shadow-sm transition hover:bg-[var(--panel-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--danger)]/30"
              aria-label="Cerrar modal"
              title="Cerrar modal"
            >
              <span aria-hidden="true" className="text-lg leading-none">
                ×
              </span>
            </button>

            <div className="max-h-[min(78vh,48rem)] space-y-4 overflow-y-auto bg-[var(--panel)] p-4 text-[var(--foreground)] sm:p-5">
              <div className="space-y-0.5 pr-10">
                <h4
                  id="assign-user-modal-title"
                  className="text-[15px] font-semibold text-[var(--foreground)] sm:text-base"
                >
                  Agregar usuario a la tienda
                </h4>
                <p className="text-[13px] text-[var(--muted)] sm:text-sm">
                  Busca un usuario y asignalo a esta tienda.
                </p>
              </div>

              <SearchBar
                value={assignSearch}
                onChange={(value) => {
                  setAssignPage(1);
                  setAssignSearch(value);
                }}
                placeholder="Buscar usuario para asignar"
                ariaLabel="Buscar usuario para asignar"
              />

              {assignError ? (
                <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
                  {assignError}
                </p>
              ) : null}

              <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)]">
                <DataTable
                  headers={assignColumns}
                  data={availableUsers}
                  isLoading={isAssignLoading}
                  rowKey="id"
                  emptyMessage="No hay usuarios disponibles para asignar."
                  badges={assignBadges}
                  rowActions={assignRowActions}
                  pagination={{
                    page: assignPage,
                    totalPages: assignTotalPages,
                    totalRecords: assignTotalRecords,
                    onPageChange: setAssignPage,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}

    </section>
  );
}
