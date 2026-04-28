"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { permissions } from "@/modules/auth/lib/permissions";
import { useAdminSession } from "@/modules/auth/providers/AdminSessionProvider";
import {
  DataTable,
  type DataTableBadgeConfig,
  type DataTableColumn,
} from "@/modules/core/components/DataTable";
import {
  ToolbarActions,
  type DataTableToolbarAction,
} from "@/modules/core/components/DataTableToolbar";
import { SearchBar } from "@/modules/core/components/SearchBar";
import { useConfirmationDialog } from "@/modules/core/providers/ConfirmationDialogProvider";
import { useToast } from "@/modules/core/providers/ToastProvider";

import { fetchRoles } from "@/modules/roles/services/roles-service";
import type { RoleListItem } from "@/modules/roles/types/roles-types";
import {
  fetchUserRoles,
  fetchUsers,
  syncUserRoles,
  toggleUserStatus,
  updateUserPassword,
} from "@/modules/users/services/user-service";
import type {
  UserRecord,
  UserRole,
} from "@/modules/users/types/users-types";

type StatusFilter = "activos" | "inactivos" | "todos";
const FORM_ANIMATION_MS = 400;

export function UsersManagementView() {
  const router = useRouter();
  const { confirm } = useConfirmationDialog();
  const toast = useToast();
  const { currentUser, stores, activeStoreId, hasPermission } = useAdminSession();
  const canSeeUsers = hasPermission(permissions.usuarios.ver);
  const canCreateUser = hasPermission(permissions.usuarios.crear);
  const canEditUsers = hasPermission(permissions.usuarios.editar);
  const canToggleUsers = hasPermission(permissions.usuarios.cambiarEstado);
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
  const [isRolesFormMounted, setIsRolesFormMounted] = useState(false);
  const [isRolesFormVisible, setIsRolesFormVisible] = useState(false);
  const closeRolesFormTimeoutRef = useRef<number | null>(null);
  const [passwordUser, setPasswordUser] = useState<UserRecord | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordFormError, setPasswordFormError] = useState<string | null>(null);
  const [passwordFormMessage, setPasswordFormMessage] = useState<string | null>(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    if (currentUser.tieneAccesoGlobal) {
      setSelectedStoreId(null);
      return;
    }

    setSelectedStoreId(activeStoreId ?? currentUser.tiendaPrincipalId ?? null);
  }, [activeStoreId, currentUser]);

  const loadUsers = useCallback(async () => {
    if (!canSeeUsers) {
      setUsers([]);
      setIsLoading(false);
      return;
    }

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
          : "No se pudieron cargar los usuarios.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [canSeeUsers, page, pageSize, search, selectedStoreId, statusFilter]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

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
            : "No se pudo cargar el catalogo de roles.",
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
        })),
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

  const clearCloseRolesFormTimeout = useCallback(() => {
    if (closeRolesFormTimeoutRef.current) {
      window.clearTimeout(closeRolesFormTimeoutRef.current);
      closeRolesFormTimeoutRef.current = null;
    }
  }, []);

  const openRolesFormPanel = useCallback(() => {
    clearCloseRolesFormTimeout();
    setIsRolesFormMounted(true);
    window.requestAnimationFrame(() => {
      setIsRolesFormVisible(true);
    });
  }, [clearCloseRolesFormTimeout]);

  const closeRolesFormPanel = useCallback(
    (shouldReset = true) => {
      setIsRolesFormVisible(false);
      clearCloseRolesFormTimeout();
      closeRolesFormTimeoutRef.current = window.setTimeout(() => {
        setIsRolesFormMounted(false);
        if (shouldReset) {
          setEditingUser(null);
          setEditingRoleNames([]);
          setRolesFormError(null);
          setRolesFormMessage(null);
        }
      }, FORM_ANIMATION_MS);
    },
    [clearCloseRolesFormTimeout],
  );

  useEffect(() => {
    return () => {
      clearCloseRolesFormTimeout();
    };
  }, [clearCloseRolesFormTimeout]);

  const handleEditRolesClick = useCallback(
    (user: UserRecord) => {
      setEditingUser(user);
      setEditingRoleNames((userRolesMap[user.id] ?? []).map((role) => role.roleName));
      setRolesFormError(null);
      setRolesFormMessage(null);
      openRolesFormPanel();
    },
    [openRolesFormPanel, userRolesMap],
  );

  const handleToggleStatus = useCallback(
    async (user: UserRecord) => {
      const action = user.status ? "inactivar" : "activar";
      const shouldContinue = await confirm({
        title: "Confirmar accion",
        description: `Deseas ${action} este usuario?`,
        confirmLabel: user.status ? "Inactivar" : "Activar",
        variant: user.status ? "danger" : "primary",
      });
      if (!shouldContinue) {
        return;
      }

      try {
        await toggleUserStatus(user.id, selectedStoreId);
        await loadUsers();
        toast.success(
          user.status
            ? "Usuario inactivado correctamente."
            : "Usuario activado correctamente.",
          "Usuario",
        );
      } catch (toggleError) {
        setError(
          toggleError instanceof Error
            ? toggleError.message
            : "No se pudo actualizar el estado del usuario.",
        );
      }
    },
    [confirm, loadUsers, selectedStoreId, toast],
  );

  const handleOpenPasswordModal = useCallback((user: UserRecord) => {
    setPasswordUser(user);
    setNewPassword("");
    setConfirmPassword("");
    setPasswordFormError(null);
    setPasswordFormMessage(null);
  }, []);

  const handleClosePasswordModal = useCallback(() => {
    if (isSavingPassword) {
      return;
    }

    setPasswordUser(null);
    setNewPassword("");
    setConfirmPassword("");
    setPasswordFormError(null);
    setPasswordFormMessage(null);
  }, [isSavingPassword]);

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
        (role) => role.roleName,
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
      toast.success("Roles de usuario actualizados correctamente.", "Usuario");
    } catch (saveError) {
      setRolesFormError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudieron actualizar los roles del usuario.",
      );
    } finally {
      setIsSavingRoles(false);
    }
  }

  async function handleSavePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!passwordUser) {
      return;
    }

    setPasswordFormError(null);
    setPasswordFormMessage(null);

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setPasswordFormError("Debes completar y confirmar la nueva contraseña.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordFormError("La confirmación no coincide con la nueva contraseña.");
      return;
    }

    setIsSavingPassword(true);

    try {
      await updateUserPassword(passwordUser.id, newPassword);
      setPasswordFormMessage("Contraseña actualizada correctamente.");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Contraseña actualizada correctamente.", "Usuario");
    } catch (saveError) {
      setPasswordFormError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo actualizar la contraseña del usuario.",
      );
    } finally {
      setIsSavingPassword(false);
    }
  }

  const columns = useMemo<DataTableColumn<UserRecord>[]>(() => {
    const baseColumns: DataTableColumn<UserRecord>[] = [
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
        header: "Telefono",
        render: (user: UserRecord) => user.telefono || "-",
      },
      {
        key: "status",
        header: "Estado",
      },
    ];

    if (canSeeRoles) {
      baseColumns.push({
        key: "roles",
        header: "Roles",
        render: (user: UserRecord) => {
          if (isLoadingUserRoles) {
            return <span className="text-xs text-[var(--muted)]">Cargando...</span>;
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

    return baseColumns;
  }, [canSeeRoles, isLoadingUserRoles, userRolesMap]);

  const stateBadges = useMemo<Array<DataTableBadgeConfig<UserRecord>>>(
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

  const rowActions =
    canManageUserRoles || canToggleUsers || canEditUsers
      ? {
          primaryButtonLabel: canManageUserRoles
            ? "Editar roles"
            : canEditUsers
              ? "Contraseña"
              : "Cambiar estado",
          onPrimaryAction: canManageUserRoles
            ? handleEditRolesClick
            : canEditUsers
              ? handleOpenPasswordModal
              : handleToggleStatus,
          dropdownOptions: [
            ...(canEditUsers && !canManageUserRoles
              ? []
              : canEditUsers
                ? [
                    {
                      label: "Cambiar contraseña",
                      onClick: handleOpenPasswordModal,
                    },
                  ]
                : []),
            ...(canToggleUsers
              ? [
                  {
                    label: (user: UserRecord) =>
                      user.status ? "Inactivar" : "Activar",
                    onClick: handleToggleStatus,
                  },
                ]
              : []),
          ],
        }
      : undefined;

  const toolbarActions = useMemo<DataTableToolbarAction[]>(
    () =>
      canCreateUser
        ? [
            {
              label: "Nuevo usuario",
              iconPath: "/icons/plus.svg",
              onClick: () => router.push("/usuarios/nuevo"),
            },
          ]
        : [],
    [canCreateUser, router],
  );

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
      <div className="space-y-4 rounded-md border border-[var(--line)] bg-[var(--panel)] p-5 shadow-md">
        <div className="flex flex-row items-center gap-2">
          <div className="min-w-0 flex-1">
            <SearchBar
              value={search}
              onChange={(value) => {
                setPage(1);
                setSearch(value);
              }}
              placeholder="Buscar por usuario o correo"
              ariaLabel="Buscar usuarios"
            />
          </div>
          <ToolbarActions actions={toolbarActions} className="shrink-0" />
        </div>

        <div className="grid gap-3 lg:grid-cols-[220px_220px] lg:justify-end">
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

          {currentUser?.tieneAccesoGlobal ? (
            <select
              value={selectedStoreId ?? ""}
              onChange={(event) => {
                setPage(1);
                const nextValue = Number(event.target.value);
                setSelectedStoreId(
                  Number.isInteger(nextValue) && nextValue > 0 ? nextValue : null,
                );
              }}
              className="app-input rounded-2xl px-4 py-3 text-sm"
            >
              <option value="">Todas las tiendas</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.nombre}
                </option>
              ))}
            </select>
          ) : (
            <div className="app-card-muted rounded-2xl px-4 py-3 text-sm text-[var(--muted)]">
              {stores.find((store) => store.id === selectedStoreId)?.nombre ??
                "Tienda actual"}
            </div>
          )}
        </div>

        {error ? (
          <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">{error}</p>
        ) : null}

        {rolesCatalogError ? (
          <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
            {rolesCatalogError}
          </p>
        ) : null}

        {userRolesError ? (
          <p className="app-alert-warning rounded-2xl px-4 py-3 text-sm">
            {userRolesError}
          </p>
        ) : null}
      </div>

      {isRolesFormMounted && editingUser ? (
        <div
          className={`origin-top overflow-hidden transition-all duration-500 ease-in-out ${
            isRolesFormVisible
              ? "max-h-[1600px] translate-y-0 opacity-100"
              : "pointer-events-none max-h-0 -translate-y-2 opacity-0"
          }`}
        >
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
                className="app-button-secondary rounded-xl px-3 py-2 text-sm"
                onClick={() => closeRolesFormPanel(true)}
              >
                Cerrar
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {availableRoles.map((role) => (
                <label
                  key={role.id}
                  className="app-card-muted flex items-start gap-3 rounded-2xl px-4 py-3 text-sm text-[var(--foreground)]"
                >
                  <input
                    type="checkbox"
                    checked={editingRoleNames.includes(role.name)}
                    onChange={(event) => {
                      setEditingRoleNames((currentRoles) =>
                        event.target.checked
                          ? [...currentRoles, role.name]
                          : currentRoles.filter(
                              (currentRoleName) => currentRoleName !== role.name,
                            ),
                      );
                    }}
                    className="mt-1"
                  />
                  <span>{role.name}</span>
                </label>
              ))}
            </div>

            {rolesFormError ? (
              <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
                {rolesFormError}
              </p>
            ) : null}

            {rolesFormMessage ? (
              <p className="app-alert-success rounded-2xl px-4 py-3 text-sm">
                {rolesFormMessage}
              </p>
            ) : null}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSavingRoles}
                className="app-button-primary rounded-2xl px-4 py-3 text-sm font-semibold disabled:opacity-60"
              >
                {isSavingRoles ? "Guardando..." : "Guardar roles"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {passwordUser ? (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/55 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="password-modal-title"
          onClick={handleClosePasswordModal}
        >
          <div
            className="app-card w-[min(92vw,32rem)] rounded-2xl p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="password-modal-title"
                  className="text-lg font-semibold text-[var(--foreground)]"
                >
                  Cambiar contraseña
                </h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Define una nueva contraseña para {passwordUser.username}.
                </p>
              </div>

              <button
                type="button"
                className="app-button-secondary rounded-xl px-3 py-2 text-sm"
                onClick={handleClosePasswordModal}
                disabled={isSavingPassword}
              >
                Cerrar
              </button>
            </div>

            <form className="mt-5 space-y-4" onSubmit={handleSavePassword}>
              <div className="space-y-2">
                <label
                  htmlFor="new-password"
                  className="text-sm font-medium text-[var(--foreground)]"
                >
                  Nueva contraseña
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="app-input w-full rounded-2xl px-4 py-3 text-sm"
                  placeholder="Minimo 8 caracteres con mayuscula, minuscula, numero y simbolo"
                  autoComplete="new-password"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirm-password"
                  className="text-sm font-medium text-[var(--foreground)]"
                >
                  Confirmar contraseña
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="app-input w-full rounded-2xl px-4 py-3 text-sm"
                  placeholder="Repite la nueva contraseña"
                  autoComplete="new-password"
                />
              </div>

              <p className="text-xs text-[var(--muted)]">
                La contraseña debe tener al menos 8 caracteres e incluir mayúscula, minúscula, número y símbolo.
              </p>

              {passwordFormError ? (
                <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
                  {passwordFormError}
                </p>
              ) : null}

              {passwordFormMessage ? (
                <p className="app-alert-success rounded-2xl px-4 py-3 text-sm">
                  {passwordFormMessage}
                </p>
              ) : null}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="app-button-secondary rounded-2xl px-4 py-3 text-sm font-medium"
                  onClick={handleClosePasswordModal}
                  disabled={isSavingPassword}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="app-button-primary rounded-2xl px-4 py-3 text-sm font-semibold disabled:opacity-60"
                >
                  {isSavingPassword ? "Guardando..." : "Guardar contraseña"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <DataTable
        headers={columns}
        data={users}
        isLoading={isLoading}
        rowKey="id"
        emptyMessage="No hay usuarios para los filtros seleccionados."
        badges={stateBadges}
        rowActions={rowActions}
        pagination={{
          page,
          totalPages,
          totalRecords,
          onPageChange: setPage,
        }}
      />
    </section>
  );
}
