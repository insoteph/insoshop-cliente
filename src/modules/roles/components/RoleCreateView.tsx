"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { permissions } from "@/modules/auth/lib/permissions";
import { useAdminSession } from "@/modules/auth/providers/AdminSessionProvider";
import { useToast } from "@/modules/core/providers/ToastProvider";
import { PermissionGroupsSelector } from "@/modules/roles/components/PermissionGroupsSelector";
import {
  createRoleWithPermissions,
  fetchPermissionsCatalog,
} from "@/modules/roles/services/roles-service";
import { buildPermissionGroups } from "@/modules/roles/mappers/roles-permissions.mapper";

export function RoleCreateView() {
  const router = useRouter();
  const { hasPermission } = useAdminSession();
  const toast = useToast();
  const canCreateRole = hasPermission(permissions.roles.crear);
  const canManagePermissions = hasPermission(permissions.permiso.gestionar);

  const [roleName, setRoleName] = useState("");
  const [permissionsCatalog, setPermissionsCatalog] = useState<string[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!canManagePermissions) {
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

  const groupedPermissions = useMemo(
    () => buildPermissionGroups(permissionsCatalog),
    [permissionsCatalog]
  );

  function togglePermission(permissionValue: string) {
    setSelectedPermissions((currentPermissions) =>
      currentPermissions.includes(permissionValue)
        ? currentPermissions.filter(
            (currentPermission) => currentPermission !== permissionValue
          )
        : [...currentPermissions, permissionValue]
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canCreateRole) {
      return;
    }

    setFormError(null);

    if (!roleName.trim()) {
      setFormError("El nombre del rol es obligatorio.");
      return;
    }

    setIsSaving(true);

    try {
      await createRoleWithPermissions({
        name: roleName.trim(),
        permissions: canManagePermissions ? selectedPermissions : [],
      });

      toast.success("Rol creado correctamente.", "Rol");
      router.push("/roles");
    } catch (saveError) {
      setFormError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo crear el rol."
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (!canCreateRole) {
    return (
      <section className="panel-card">
        <p className="text-sm text-[var(--muted)]">
          No tienes permisos para crear roles.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="panel-card space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              Módulo administrativo
            </p>
            <h1 className="text-2xl font-semibold text-[var(--foreground)]">
              Crear rol
            </h1>
            <p className="max-w-3xl text-sm text-[var(--muted)]">
              Vista dedicada para la creación de un nuevo rol.
            </p>
          </div>

          <Link
            href="/roles"
            className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-[var(--foreground)]"
          >
            Volver al listado
          </Link>
        </div>
      </div>

      <form className="panel-card space-y-4" onSubmit={handleSubmit}>
        <input
          required
          value={roleName}
          onChange={(event) => setRoleName(event.target.value)}
          placeholder="Nombre del rol"
          className="app-input rounded-2xl px-4 py-3 text-sm"
        />

        {canManagePermissions ? (
          catalogError ? (
            <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
              {catalogError}
            </p>
          ) : (
            <div className="space-y-4">
              <PermissionGroupsSelector
                groups={groupedPermissions}
                selectedPermissions={selectedPermissions}
                onTogglePermission={togglePermission}
                onSelectAll={() => setSelectedPermissions(permissionsCatalog)}
                onClearAll={() => setSelectedPermissions([])}
              />
            </div>
          )
        ) : (
          <p className="app-card-muted rounded-2xl px-4 py-3 text-sm text-[var(--muted)]">
            Tu usuario puede crear roles, pero no gestionar claims de permisos.
          </p>
        )}

        {formError ? (
          <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
            {formError}
          </p>
        ) : null}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="app-button-primary rounded-2xl px-4 py-3 text-sm font-semibold disabled:opacity-60"
          >
            {isSaving ? "Guardando..." : "Crear rol"}
          </button>
        </div>
      </form>
    </section>
  );
}
