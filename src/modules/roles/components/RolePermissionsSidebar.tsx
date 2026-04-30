"use client";

import type { RolePermission } from "@/modules/roles/types/roles-types";

type RolePermissionsSidebarProps = {
  selectedRoleId: string | null;
  selectedRoleName: string;
  canManagePermissions: boolean;
  isLoadingRolePermissions: boolean;
  rolePermissionsError: string | null;
  selectedRolePermissions: RolePermission[];
};

export function RolePermissionsSidebar({
  selectedRoleId,
  selectedRoleName,
  canManagePermissions,
  isLoadingRolePermissions,
  rolePermissionsError,
  selectedRolePermissions,
}: RolePermissionsSidebarProps) {
  return (
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
        <p className="app-card-muted rounded-2xl px-4 py-3 text-sm text-[var(--muted)]">
          No tienes permisos para consultar claims de rol.
        </p>
      ) : isLoadingRolePermissions ? (
        <p className="text-sm text-[var(--muted)]">Cargando permisos...</p>
      ) : rolePermissionsError ? (
        <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
          {rolePermissionsError}
        </p>
      ) : selectedRoleId ? (
        selectedRolePermissions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedRolePermissions.map((permissionItem) => (
              <span
                key={`${permissionItem.claimType}:${permissionItem.claimValue}`}
                className="app-card-muted rounded-full px-3 py-1 text-xs font-medium text-[var(--foreground)]"
              >
                {permissionItem.claimValue}
              </span>
            ))}
          </div>
        ) : (
          <p className="app-card-muted rounded-2xl px-4 py-3 text-sm text-[var(--muted)]">
            Este rol no tiene permisos asignados.
          </p>
        )
      ) : null}
    </aside>
  );
}
