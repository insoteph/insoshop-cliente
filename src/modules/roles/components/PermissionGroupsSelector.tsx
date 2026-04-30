"use client";

import type { PermissionGroup } from "@/modules/roles/mappers/roles-permissions.mapper";

type PermissionGroupsSelectorProps = {
  groups: PermissionGroup[];
  selectedPermissions: string[];
  onTogglePermission: (permissionValue: string) => void;
  onSelectAll?: () => void;
  onClearAll?: () => void;
};

export function PermissionGroupsSelector({
  groups,
  selectedPermissions,
  onTogglePermission,
  onSelectAll,
  onClearAll,
}: PermissionGroupsSelectorProps) {
  return (
    <div className="space-y-4">
      {onSelectAll || onClearAll ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[var(--foreground)]">
              Permisos
            </h2>
            <p className="text-sm text-[var(--muted)]">
              {selectedPermissions.length} permiso
              {selectedPermissions.length === 1 ? "" : "s"} seleccionado
              {selectedPermissions.length === 1 ? "" : "s"}.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {onSelectAll ? (
              <button
                type="button"
                className="app-button-secondary rounded-xl px-3 py-2 text-xs font-medium"
                onClick={onSelectAll}
              >
                Seleccionar todo
              </button>
            ) : null}
            {onClearAll ? (
              <button
                type="button"
                className="app-button-secondary rounded-xl px-3 py-2 text-xs font-medium"
                onClick={onClearAll}
              >
                Limpiar
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        {groups.map((group) => (
          <div key={group.label} className="app-card-muted rounded-3xl p-4">
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
                    checked={selectedPermissions.includes(permissionValue)}
                    onChange={() => onTogglePermission(permissionValue)}
                    className="mt-1"
                  />
                  <span>{permissionValue}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
