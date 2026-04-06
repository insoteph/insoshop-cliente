"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { permissions } from "@/modules/auth/lib/permissions";
import { useAdminSession } from "@/modules/auth/providers/AdminSessionProvider";
import { DataTable } from "@/modules/core/components/DataTable";
import { PaginationControls } from "@/modules/core/components/PaginationControls";
import { fetchRoles } from "@/modules/roles/services/roles-service";
import type { RoleListItem } from "@/modules/roles/types/roles-types";
import {
  fetchUserRoles,
  fetchUsers,
  syncUserRoles,
} from "@/modules/users/services/user-service";
import type {
  UserRecord,
  UserRole,
} from "@/modules/users/types/users-types";

type StatusFilter = "activos" | "inactivos" | "todos";

export function UsersManagementView() {
  const router = useRouter();
  const { currentUser, stores, activeStoreId, hasPermission } = useAdminSession();
  const canSeeUsers = hasPermission(permissions.usuarios.ver);
  const canCreateUser = hasPermission(permissions.usuarios.crear);
  const canSeeRoles = hasPermission(permissions.roles.ver);
  const canManageUserRoles =
    canSeeRoles && hasPermission(permissions.roles.gestionarUsuarios);

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [availableRoles, setAvailableRoles] = useState<RoleListItem[]>([]);
  const [rolesCatalogError, setRolesCatalogError] = useState<string | null>(null);
  const [userRolesMap, setUserRolesMap] = useState<Record<string, UserRole[]>>({});
  const [isLoadingUserRoles, setIsLoadingUserRoles] = useState(false);
  const [userRolesError, setUserRolesError] = useState<string | null>(null);

  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [editingRoleNames, setEditingRoleNames] = useState<string[]>([]);
  const [rolesFormError, setRolesFormError] = useState<string | null>(null);
  const [rolesFormMessage, setRolesFormMessage] = useState<string | null>(null);
  const [isSavingRoles, setIsSavingRoles] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    if (currentUser.tieneAccesoGlobal) {
      setSelectedStoreId(activeStoreId ?? null);
      return;
    }

    setSelectedStoreId(activeStoreId ?? currentUser.tiendaPrincipalId ?? null);
  }, [activeStoreId, currentUser]);

  useEffect(() => {
    if (!canSeeUsers) {
      setUsers([]);
      setIsLoading(false);
      return;
    }

    async function loadUsers() {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchUsers({
          storeId: selectedStoreId,
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
            : "No se pudieron cargar los usuarios."
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadUsers();
  }, [canSeeUsers, page, pageSize, search, selectedStoreId, statusFilter]);

  useEffect(() => {
    if (!canSeeRoles) {
      setAvailableRoles([]);
      setRolesCatalogError(null);
      return;
    }

    async function loadRolesCatalog() {
      setRolesCatalogError(null);

      try {
        const result = await fetchRoles({
          page: 1,
          pageSize: 200,
        });
        setAvailableRoles(result.items);
      } catch (loadError) {
        setRolesCatalogError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudo cargar el catálogo de roles."
        );
      }
    }

    void loadRolesCatalog();
  }, [canSeeRoles]);

  useEffect(() => {
    if (!canSeeRoles || users.length === 0) {
      setUserRolesMap({});
      setUserRolesError(null);
      return;
    }

    async function loadRolesByUser() {
      setIsLoadingUserRoles(true);
      setUserRolesError(null);

      const responses = await Promise.allSettled(
        users.map(async (user) => ({
          userId: user.id,
          roles: await fetchUserRoles(user.id),
        }))
      );

      const nextMap: Record<string, UserRole[]> = {};
      let failedCount = 0;

      for (const response of responses) {
        if (response.status === "fulfilled") {
          nextMap[response.value.userId] = response.value.roles;
          continue;
        }

        failedCount += 1;
      }

      setUserRolesMap(nextMap);
      setIsLoadingUserRoles(false);

      if (failedCount > 0) {
        setUserRolesError("No se pudieron obtener todos los roles de usuario.");
      }
    }

    void loadRolesByUser();
  }, [canSeeRoles, users]);

  async function handleSaveRoles(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingUser) {
      return;
    }

    setRolesFormError(null);
    setRolesFormMessage(null);
    setIsSavingRoles(true);

    try {
      const currentRoles = (userRolesMap[editingUser.id] ?? []).map(
        (role) => role.roleName
      );

      await syncUserRoles({
        userId: editingUser.id,
        currentRoles,
        nextRoles: editingRoleNames,
      });

      const refreshedRoles = await fetchUserRoles(editingUser.id);
      setUserRolesMap((currentMap) => ({
        ...currentMap,
        [editingUser.id]: refreshedRoles,
      }));
      setRolesFormMessage("Roles actualizados correctamente.");
    } catch (saveError) {
      setRolesFormError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudieron actualizar los roles del usuario."
      );
    } finally {
      setIsSavingRoles(false);
    }
  }

  const columns = useMemo(() => {
    const baseColumns = [
      {
        key: "username",
        header: "Usuario",
        render: (user: UserRecord) => (
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
        header: "Teléfono",
        render: (user: UserRecord) => user.telefono || "-",
      },
      {
        key: "status",
        header: "Estado",
        render: (user: UserRecord) => (
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
              user.status
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-200 text-slate-700"
            }`}
          >
            {user.status ? "Activo" : "Inactivo"}
          </span>
        ),
      },
    ];

    if (canSeeRoles) {
      baseColumns.push({
        key: "roles",
        header: "Roles",
        render: (user: UserRecord) => {
          if (isLoadingUserRoles) {
            return (
              <span className="text-xs text-[var(--muted)]">Cargando...</span>
            );
          }

          const assignedRoles = userRolesMap[user.id] ?? [];

          if (assignedRoles.length === 0) {
            return <span className="text-xs text-[var(--muted)]">Sin roles</span>;
          }

          return (
            <div className="flex flex-wrap gap-2">
              {assignedRoles.map((role) => (
                <span
                  key={`${user.id}-${role.roleId}`}
                  className="rounded-full border border-[var(--line)] bg-[var(--panel-muted)] px-3 py-1 text-xs font-medium text-[var(--foreground)]"
                >
                  {role.roleName}
                </span>
              ))}
            </div>
          );
        },
      });
    }

    if (canManageUserRoles) {
      baseColumns.push({
        key: "actions",
        header: "Acciones",
        className: "w-[160px]",
        render: (user: UserRecord) => (
          <div className="flex justify-end">
            <button
              type="button"
              className="rounded-xl border border-[var(--line)] px-3 py-2 text-xs font-medium text-[var(--foreground)]"
              onClick={() => {
                setEditingUser(user);
                setEditingRoleNames(
                  (userRolesMap[user.id] ?? []).map((role) => role.roleName)
                );
                setRolesFormError(null);
                setRolesFormMessage(null);
              }}
            >
              Editar roles
            </button>
          </div>
        ),
      });
    }

    return baseColumns;
  }, [canManageUserRoles, canSeeRoles, isLoadingUserRoles, userRolesMap]);

  if (!canSeeUsers) {
    return (
      <section className="panel-card">
        <p className="text-sm text-[var(--muted)]">
          No tienes permisos para consultar usuarios.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="panel-card space-y-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              Módulo administrativo
            </p>
            <h1 className="text-2xl font-semibold text-[var(--foreground)]">
              Usuarios
            </h1>
            <p className="max-w-3xl text-sm text-[var(--muted)]">
              Listado de usuarios con acciones operativas y administración de roles.
            </p>
          </div>

          {canCreateUser ? (
            <button
              type="button"
              className="rounded-2xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white"
              onClick={() => router.push("/usuarios/nuevo")}
            >
              Crear nuevo usuario
            </button>
          ) : null}
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
          <input
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            placeholder="Buscar por usuario o correo"
            className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3 text-sm text-[var(--foreground)] outline-none"
          />
          <select
            value={statusFilter}
            onChange={(event) => {
              setPage(1);
              setStatusFilter(event.target.value as StatusFilter);
            }}
            className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3 text-sm text-[var(--foreground)] outline-none"
          >
            <option value="todos">Todos los estados</option>
            <option value="activos">Solo activos</option>
            <option value="inactivos">Solo inactivos</option>
          </select>

          {currentUser?.tieneAccesoGlobal ? (
            <select
              value={selectedStoreId ?? ""}
              onChange={(event) => {
                setPage(1);
                const nextValue = Number(event.target.value);
                setSelectedStoreId(
                  Number.isInteger(nextValue) && nextValue > 0 ? nextValue : null
                );
              }}
              className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3 text-sm text-[var(--foreground)] outline-none"
            >
              <option value="">Todas las tiendas</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.nombre}
                </option>
              ))}
            </select>
          ) : (
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3 text-sm text-[var(--muted)]">
              {stores.find((store) => store.id === selectedStoreId)?.nombre ??
                "Tienda actual"}
            </div>
          )}
        </div>

        {error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {rolesCatalogError ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {rolesCatalogError}
          </p>
        ) : null}

        {userRolesError ? (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {userRolesError}
          </p>
        ) : null}
      </div>

      {canManageUserRoles && editingUser ? (
        <form className="panel-card space-y-4" onSubmit={handleSaveRoles}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                Editar roles de {editingUser.username}
              </h2>
              <p className="text-sm text-[var(--muted)]">
                Selecciona los roles que deben quedar asignados al usuario.
              </p>
            </div>

            <button
              type="button"
              className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-[var(--foreground)]"
              onClick={() => {
                setEditingUser(null);
                setEditingRoleNames([]);
                setRolesFormError(null);
                setRolesFormMessage(null);
              }}
            >
              Cerrar
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {availableRoles.map((role) => (
              <label
                key={role.id}
                className="flex items-start gap-3 rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3 text-sm text-[var(--foreground)]"
              >
                <input
                  type="checkbox"
                  checked={editingRoleNames.includes(role.name)}
                  onChange={(event) => {
                    setEditingRoleNames((currentRoles) =>
                      event.target.checked
                        ? [...currentRoles, role.name]
                        : currentRoles.filter(
                            (currentRoleName) => currentRoleName !== role.name
                          )
                    );
                  }}
                  className="mt-1"
                />
                <span>{role.name}</span>
              </label>
            ))}
          </div>

          {rolesFormError ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {rolesFormError}
            </p>
          ) : null}

          {rolesFormMessage ? (
            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {rolesFormMessage}
            </p>
          ) : null}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSavingRoles}
              className="rounded-2xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isSavingRoles ? "Guardando..." : "Guardar roles"}
            </button>
          </div>
        </form>
      ) : null}

      <DataTable
        headers={columns}
        data={users}
        isLoading={isLoading}
        rowKey="id"
        emptyMessage="No hay usuarios para los filtros seleccionados."
      />

      <PaginationControls
        page={page}
        totalPages={totalPages}
        totalRecords={totalRecords}
        onPageChange={setPage}
      />
    </section>
  );
}
