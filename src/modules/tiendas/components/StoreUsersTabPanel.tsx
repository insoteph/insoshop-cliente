"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  DataTable,
  type DataTableBadgeConfig,
  type DataTableColumn,
} from "@/modules/core/components/DataTable";
import {
  DataTableToolbar,
  ToolbarActions,
  type DataTableToolbarAction,
} from "@/modules/core/components/DataTableToolbar";
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

type StatusFilter = "activos" | "inactivos" | "todos";
const FORM_ANIMATION_MS = 400;

export function StoreUsersTabPanel({ storeId }: StoreUsersTabPanelProps) {
  const { confirm } = useConfirmationDialog();
  const [users, setUsers] = useState<TiendaUsuario[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAssignPanelMounted, setIsAssignPanelMounted] = useState(false);
  const [isAssignPanelVisible, setIsAssignPanelVisible] = useState(false);
  const closeAssignPanelTimeoutRef = useRef<number | null>(null);

  const [availableUsers, setAvailableUsers] = useState<UserRecord[]>([]);
  const [assignPage, setAssignPage] = useState(1);
  const [assignPageSize, setAssignPageSize] = useState(8);
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
        estadoFiltro: statusFilter,
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
  }, [page, pageSize, search, statusFilter, storeId]);

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

  const toolbarActions = useMemo<DataTableToolbarAction[]>(
    () => [
      {
        label: isAssignPanelMounted ? "Cerrar formulario" : "Agregar usuario",
        iconPath: isAssignPanelMounted ? "/icons/cross.svg" : "/icons/plus.svg",
        onClick: () => {
          if (isAssignPanelMounted) {
            closeAssignPanel();
            return;
          }
          openAssignPanel();
        },
      },
    ],
    [closeAssignPanel, isAssignPanelMounted, openAssignPanel],
  );

  return (
    <section className="space-y-5">
      <div className="space-y-4 rounded-md border border-[var(--line)] bg-[var(--panel)] p-5 shadow-md">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="w-full">
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
          <ToolbarActions actions={toolbarActions} className="md:shrink-0" />
        </div>

        <div className="grid gap-3 md:grid-cols-[220px] md:justify-end">
          <select
            value={statusFilter}
            onChange={(event) => {
              setPage(1);
              setStatusFilter(event.target.value as StatusFilter);
            }}
            className="app-input rounded-2xl px-4 py-3 text-sm"
          >
            <option value="todos">Todos los estados</option>
            <option value="activos">Solo activos</option>
            <option value="inactivos">Solo inactivos</option>
          </select>
        </div>

        {error ? (
          <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">{error}</p>
        ) : null}
      </div>

      {isAssignPanelMounted ? (
        <div
          className={`origin-top overflow-hidden transition-all duration-500 ease-in-out ${
            isAssignPanelVisible
              ? "max-h-[1400px] translate-y-0 opacity-100"
              : "pointer-events-none max-h-0 -translate-y-2 opacity-0"
          }`}
        >
          <div className="space-y-4 rounded-md border border-[var(--line)] bg-[var(--panel)] p-5 shadow-md">
            <div className="space-y-1">
              <h4 className="text-lg font-semibold text-[var(--foreground)]">
                Agregar usuario a la tienda
              </h4>
              <p className="text-sm text-[var(--muted)]">
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

            <div className="app-card rounded-2xl py-2">
              <DataTableToolbar
                pageSize={assignPageSize}
                onPageSizeChange={(value) => {
                  setAssignPage(1);
                  setAssignPageSize(value);
                }}
              />
              <div className="app-divider mb-2 mt-1 border-b" />
              <div className="px-3">
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

      <div className="app-card rounded-2xl py-2">
        <DataTableToolbar
          pageSize={pageSize}
          onPageSizeChange={(value) => {
            setPage(1);
            setPageSize(value);
          }}
        />
        <div className="app-divider mb-2 mt-1 border-b" />
        <div className="px-3">
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
    </section>
  );
}
