"use client";

import type { FormEvent } from "react";

import { PermissionGroupsSelector } from "@/modules/roles/components/PermissionGroupsSelector";
import type { PermissionGroup } from "@/modules/roles/mappers/roles-permissions.mapper";

type RoleEditFormProps = {
  editingName: string;
  isEditFormVisible: boolean;
  isEditFormMounted: boolean;
  isSaving: boolean;
  formError: string | null;
  canManagePermissions: boolean;
  catalogError: string | null;
  selectedPermissions: string[];
  permissionGroups: PermissionGroup[];
  onEditingNameChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onTogglePermission: (permissionValue: string) => void;
  onSelectAllPermissions: () => void;
  onClearPermissions: () => void;
};

export function RoleEditForm({
  editingName,
  isEditFormVisible,
  isEditFormMounted,
  isSaving,
  formError,
  canManagePermissions,
  catalogError,
  selectedPermissions,
  permissionGroups,
  onEditingNameChange,
  onClose,
  onSubmit,
  onTogglePermission,
  onSelectAllPermissions,
  onClearPermissions,
}: RoleEditFormProps) {
  if (!isEditFormMounted) {
    return null;
  }

  return (
    <div
      className={`grid origin-top transition-all duration-500 ease-in-out ${
        isEditFormVisible
          ? "grid-rows-[1fr] translate-y-0 opacity-100"
          : "pointer-events-none grid-rows-[0fr] -translate-y-2 opacity-0"
      }`}
    >
      <div className="min-h-0 overflow-hidden">
        <form className="panel-card space-y-4" onSubmit={onSubmit}>
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
              className="app-button-secondary rounded-xl px-3 py-2 text-sm"
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>

          <input
            required
            value={editingName}
            onChange={(event) => onEditingNameChange(event.target.value)}
            placeholder="Nombre del rol"
            className="app-input rounded-2xl px-4 py-3 text-sm"
          />

          {canManagePermissions ? (
            catalogError ? (
              <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
                {catalogError}
              </p>
            ) : (
              <PermissionGroupsSelector
                groups={permissionGroups}
                selectedPermissions={selectedPermissions}
                onTogglePermission={onTogglePermission}
                onSelectAll={onSelectAllPermissions}
                onClearAll={onClearPermissions}
              />
            )
          ) : (
            <p className="app-card-muted rounded-2xl px-4 py-3 text-sm text-[var(--muted)]">
              Tu usuario puede editar roles, pero no claims de permisos.
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
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
