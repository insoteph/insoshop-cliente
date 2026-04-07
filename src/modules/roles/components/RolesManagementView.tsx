"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { permissions } from "@/modules/auth/lib/permissions";
import { useAdminSession } from "@/modules/auth/providers/AdminSessionProvider";
import { DataTable } from "@/modules/core/components/DataTable";

import {
  deleteRole,
  fetchPermissionsCatalog,
  fetchRolePermissions,
  fetchRoles,
  syncRolePermissions,
  updateRole,
} from "@/modules/roles/services/roles-service";
import type {
  RoleListItem,
  RolePermission,
} from "@/modules/roles/types/roles-types";

type EditingRole = {
  id: string;
  name: string;
} | null;

function buildPermissionGroups(items: string[]) {
  const groups = new Map<string, string[]>();

  for (const permission of items) {
    const [groupLabel = "General"] = permission.split(".");
    const groupItems = groups.get(groupLabel) ?? [];
    groupItems.push(permission);
    groups.set(groupLabel, groupItems);
  }

  return Array.from(groups.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([label, groupItems]) => ({
      label,
      items: groupItems.sort((left, right) => left.localeCompare(right)),
    }));
}

export function RolesManagementView() {
  const router = useRouter();
  const { hasPermission } = useAdminSession();
  const canCreateRole = hasPermission(permissions.roles.crear);
  const canEditRole = hasPermission(permissions.roles.editar);
  const canDeleteRole = hasPermission(permissions.roles.eliminar);
  const canManagePermissions = hasPermission(permissions.permiso.gestionar);

  const [roles, setRoles] = useState<RoleListItem[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [permissionsCatalog, setPermissionsCatalog] = useState<string[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [selectedRoleName, setSelectedRoleName] = useState("");
  const [selectedRolePermissions, setSelectedRolePermissions] = useState<
    RolePermission[]
  >([]);
  const [isLoadingRolePermissions, setIsLoadingRolePermissions] =
    useState(false);
  const [rolePermissionsError, setRolePermissionsError] = useState<
    string | null
  >(null);

  const [editingRole, setEditingRole] = useState<EditingRole>(null);
  const [editingName, setEditingName] = useState("");
  const [editingPermissions, setEditingPermissions] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingRoleId, setIsDeletingRoleId] = useState<string | null>(null);

  const loadRoles = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchRoles({
        page,
        pageSize,
        search,
      });

      setRoles(result.items);
      setTotalPages(result.totalPages);
      setTotalRecords(result.totalRecords);

      if (selectedRoleId && result.items.some((role) => role.id === selectedRoleId)) {
        const currentRole = result.items.find((role) => role.id === selectedRoleId);
        setSelectedRoleName(currentRole?.name ?? "");
      } else {
        const firstRole = result.items[0] ?? null;
        setSelectedRoleId(firstRole?.id ?? null);
        setSelectedRoleName(firstRole?.name ?? "");
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudieron cargar los roles."
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search, selectedRoleId]);

  useEffect(() => {
    void loadRoles();
  }, [loadRoles]);

  useEffect(() => {
    if (!canManagePermissions) {
      setPermissionsCatalog([]);
      setCatalogError(null);
      return;
    }

    async function loadCatalog() {
      setCatalogError(null);

      try {
        const result = await fetchPermissionsCatalog();
        setPermissionsCatalog(result);
      } catch (loadError) {
        setCatalogError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudo cargar el catálogo de permisos."
        );
      }
    }

    void loadCatalog();
  }, [canManagePermissions]);

  useEffect(() => {
    if (!selectedRoleId || !canManagePermissions) {
      setSelectedRolePermissions([]);
      setRolePermissionsError(null);
      return;
    }

    async function loadDetailPermissions() {
      setIsLoadingRolePermissions(true);
      setRolePermissionsError(null);

      try {
        const result = await fetchRolePermissions(selectedRoleId);
        setSelectedRolePermissions(result);
      } catch (loadError) {
        setRolePermissionsError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudieron cargar los permisos del rol."
        );
      } finally {
        setIsLoadingRolePermissions(false);
      }
    }

    void loadDetailPermissions();
  }, [canManagePermissions, selectedRoleId]);

  function resetEditForm() {
    setEditingRole(null);
    setEditingName("");
    setEditingPermissions([]);
    setFormError(null);
  }

  function toggleEditingPermission(permissionValue: string) {
    setEditingPermissions((currentPermissions) =>
      currentPermissions.includes(permissionValue)
        ? currentPermissions.filter(
            (currentPermission) => currentPermission !== permissionValue
          )
        : [...currentPermissions, permissionValue]
    );
  }

  const handleEditRole = useCallback(async (role: RoleListItem) => {
    setFormError(null);
    setFormMessage(null);
    setEditingRole({
      id: role.id,
      name: role.name,
    });
    setEditingName(role.name);
    setSelectedRoleId(role.id);
    setSelectedRoleName(role.name);

    if (!canManagePermissions) {
      setEditingPermissions([]);
      return;
    }

    try {
      const rolePermissions = await fetchRolePermissions(role.id);
      setEditingPermissions(
        rolePermissions.map((permissionItem) => permissionItem.claimValue)
      );
    } catch (loadError) {
      setFormError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudieron cargar los permisos del rol."
      );
    }
  }, [canManagePermissions]);

  async function handleSubmitEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingRole) {
      return;
    }

    setFormError(null);
    setFormMessage(null);

    if (!editingName.trim()) {
      setFormError("El nombre del rol es obligatorio.");
      return;
    }

    setIsSaving(true);

    try {
      await updateRole({
        roleId: editingRole.id,
        name: editingName.trim(),
      });

      if (canManagePermissions) {
        const currentPermissions = (
          await fetchRolePermissions(editingRole.id)
        ).map((permissionItem) => permissionItem.claimValue);

        await syncRolePermissions({
          roleId: editingRole.id,
          currentPermissions,
          nextPermissions: editingPermissions,
        });
      }

      setSelectedRoleId(editingRole.id);
      setSelectedRoleName(editingName.trim());
      setFormMessage("Rol actualizado correctamente.");
      resetEditForm();
      await loadRoles();
    } catch (saveError) {
      setFormError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo actualizar el rol."
      );
    } finally {
      setIsSaving(false);
    }
  }

  const columns = useMemo(
    () => [
      {
        key: "name",
        header: "Rol",
        render: (role: RoleListItem) => (
          <div className="space-y-1">
            <p className="font-semibold text-[var(--foreground)]">{role.name}</p>
            <p className="text-xs text-[var(--muted)]">ID: {role.id}</p>
          </div>
        ),
      },
      {
        key: "actions",
        header: "Acciones",
        className: "w-[280px]",
        render: (role: RoleListItem) => (
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              className="rounded-xl border border-[var(--line)] px-3 py-2 text-xs font-medium text-[var(--foreground)]"
              onClick={() => {
                setSelectedRoleId(role.id);
                setSelectedRoleName(role.name);
              }}
            >
              Ver detalle
            </button>

            {canEditRole ? (
              <button
                type="button"
                className="rounded-xl border border-[var(--line)] px-3 py-2 text-xs font-medium text-[var(--foreground)]"
                onClick={() => void handleEditRole(role)}
              >
                Editar
              </button>
            ) : null}

            {canDeleteRole ? (
              <button
                type="button"
                disabled={isDeletingRoleId === role.id}
                className="rounded-xl border border-red-200 px-3 py-2 text-xs font-medium text-red-700 disabled:opacity-60"
                onClick={async () => {
                  const confirmed = window.confirm(
                    `Se eliminará el rol "${role.name}".`
                  );

                  if (!confirmed) {
                    return;
                  }

                  setError(null);
                  setFormMessage(null);
                  setIsDeletingRoleId(role.id);

                  try {
                    await deleteRole(role.id);
                    if (selectedRoleId === role.id) {
                      setSelectedRoleId(null);
                      setSelectedRoleName("");
                      setSelectedRolePermissions([]);
                    }
                    if (editingRole?.id === role.id) {
                      resetEditForm();
                    }
                    setFormMessage("Rol eliminado correctamente.");
                    await loadRoles();
                  } catch (deleteError) {
                    setError(
                      deleteError instanceof Error
                        ? deleteError.message
                        : "No se pudo eliminar el rol."
                    );
                  } finally {
                    setIsDeletingRoleId(null);
                  }
                }}
              >
                {isDeletingRoleId === role.id ? "Eliminando..." : "Eliminar"}
              </button>
            ) : null}
          </div>
        ),
      },
    ],
    [canDeleteRole, canEditRole, editingRole?.id, handleEditRole, isDeletingRoleId, loadRoles, selectedRoleId]
  );

  return (
    <section className="space-y-6">
      <div className="panel-card space-y-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              Módulo administrativo
            </p>
            <h1 className="text-2xl font-semibold text-[var(--foreground)]">
              Roles
            </h1>
            <p className="max-w-3xl text-sm text-[var(--muted)]">
              Listado de roles con acciones de detalle, edición y eliminación.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 md:flex-row xl:max-w-2xl">
            <input
              value={search}
              onChange={(event) => {
                setPage(1);
                setSearch(event.target.value);
              }}
              placeholder="Buscar rol"
              className="w-full rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3 text-sm text-[var(--foreground)] outline-none"
            />

            {canCreateRole ? (
              <button
                type="button"
                className="rounded-2xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white"
                onClick={() => router.push("/roles/nuevo")}
              >
                Crear nuevo rol
              </button>
            ) : null}
          </div>
        </div>

        {error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {formMessage ? (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {formMessage}
          </p>
        ) : null}
      </div>

      {editingRole ? (
        <form className="panel-card space-y-4" onSubmit={handleSubmitEdit}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                Editar rol
              </h2>
              <p className="text-sm text-[var(--muted)]">
                Actualiza el nombre del rol y sus permisos.
              </p>
            </div>

            <button
              type="button"
              className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-[var(--foreground)]"
              onClick={resetEditForm}
            >
              Cerrar
            </button>
          </div>

          <input
            required
            value={editingName}
            onChange={(event) => setEditingName(event.target.value)}
            placeholder="Nombre del rol"
            className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3 text-sm text-[var(--foreground)] outline-none"
          />

          {canManagePermissions ? (
            catalogError ? (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {catalogError}
              </p>
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {buildPermissionGroups(permissionsCatalog).map((group) => (
                  <div
                    key={group.label}
                    className="rounded-3xl border border-[var(--line)] bg-[var(--panel-muted)] p-4"
                  >
                    <p className="mb-3 text-sm font-semibold text-[var(--foreground)]">
                      {group.label}
                    </p>
                    <div className="space-y-3">
                      {group.items.map((permissionValue) => (
                        <label
                          key={permissionValue}
                          className="flex items-start gap-3 text-sm text-[var(--foreground)]"
                        >
                          <input
                            type="checkbox"
                            checked={editingPermissions.includes(permissionValue)}
                            onChange={() => toggleEditingPermission(permissionValue)}
                            className="mt-1"
                          />
                          <span>{permissionValue}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <p className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3 text-sm text-[var(--muted)]">
              Tu usuario puede editar roles, pero no claims de permisos.
            </p>
          )}

          {formError ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </p>
          ) : null}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-2xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
        <div className="space-y-4">
          <DataTable
            headers={columns}
            data={roles}
            isLoading={isLoading}
            rowKey="id"
            emptyMessage="No hay roles registrados."
            pagination={{
              page,
              totalPages,
              totalRecords,
              onPageChange: setPage,
            }}
          />
        </div>

        <aside className="panel-card space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              Detalle del rol
            </p>
            <h2 className="text-xl font-semibold text-[var(--foreground)]">
              {selectedRoleName || "Selecciona un rol"}
            </h2>
            <p className="text-sm text-[var(--muted)]">
              {selectedRoleId
                ? "Consulta el conjunto de permisos asignado."
                : "Elige un rol del listado para ver su configuración actual."}
            </p>
          </div>

          {!canManagePermissions ? (
            <p className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3 text-sm text-[var(--muted)]">
              No tienes permisos para consultar claims de rol.
            </p>
          ) : isLoadingRolePermissions ? (
            <p className="text-sm text-[var(--muted)]">Cargando permisos...</p>
          ) : rolePermissionsError ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {rolePermissionsError}
            </p>
          ) : selectedRoleId ? (
            selectedRolePermissions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedRolePermissions.map((permissionItem) => (
                  <span
                    key={`${permissionItem.claimType}:${permissionItem.claimValue}`}
                    className="rounded-full border border-[var(--line)] bg-[var(--panel-muted)] px-3 py-1 text-xs font-medium text-[var(--foreground)]"
                  >
                    {permissionItem.claimValue}
                  </span>
                ))}
              </div>
            ) : (
              <p className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3 text-sm text-[var(--muted)]">
                Este rol no tiene permisos asignados.
              </p>
            )
          ) : null}
        </aside>
      </div>
    </section>
  );
}

