"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { permissions } from "@/modules/auth/lib/permissions";
import { useAdminSession } from "@/modules/auth/providers/AdminSessionProvider";
import type { DataTableRowActionsConfig } from "@/modules/core/components/DataTable";
import type { RoleListItem } from "@/modules/roles/types/roles-types";
import { useRoleEditor } from "@/modules/roles/hooks/useRoleEditor";
import { useRolesListManagement } from "@/modules/roles/hooks/useRolesListManagement";

export function useRolesManagement() {
  const router = useRouter();
  const { hasPermission } = useAdminSession();

  const canCreateRole = hasPermission(permissions.roles.crear);
  const canManagePermissions = hasPermission(permissions.permiso.gestionar);

  const list = useRolesListManagement({ canManagePermissions });
  const editor = useRoleEditor({
    canManagePermissions,
    onRoleSelected: list.handleSelectRole,
    onRoleUpdated: async (updatedRole: RoleListItem) => {
      list.handleSelectRole(updatedRole);
      await list.refreshRoles();
    },
  });

  const handleCreateRoleClick = useCallback(() => {
    router.push("/roles/nuevo");
  }, [router]);

  const handleDeleteRole = async (role: RoleListItem) => {
    const wasDeleted = await list.handleDeleteRole(role);

    if (wasDeleted && editor.editingRoleId === role.id) {
      editor.closeEditFormPanel(true);
    }
  };

  const rowActions: DataTableRowActionsConfig<RoleListItem> = {
    primaryButtonLabel: "Detalles",
    onPrimaryAction: list.handleSelectRole,
    dropdownOptions: [
      ...(list.canEditRole
        ? [
            {
              label: "Editar",
              onClick: (role: RoleListItem) => void editor.handleEditRole(role),
            },
          ]
        : []),
      ...(list.canDeleteRole
        ? [
            {
              label: "Eliminar",
              onClick: async (role: RoleListItem) => {
                await handleDeleteRole(role);
              },
              hidden: (role: RoleListItem) => list.isDeletingRoleId === role.id,
            },
          ]
        : []),
    ],
  };

  return {
    canCreateRole,
    canManagePermissions,
    roles: list.roles,
    page: list.page,
    totalPages: list.totalPages,
    totalRecords: list.totalRecords,
    search: list.search,
    isLoading: list.isLoading,
    error: list.error,
    rowActions,
    selectedRoleId: list.selectedRoleId,
    selectedRoleName: list.selectedRoleName,
    selectedRolePermissions: list.selectedRolePermissions,
    isLoadingRolePermissions: list.isLoadingRolePermissions,
    rolePermissionsError: list.rolePermissionsError,
    isEditFormMounted: editor.isEditFormMounted,
    isEditFormVisible: editor.isEditFormVisible,
    editingName: editor.editingName,
    isSaving: editor.isSaving,
    formError: editor.formError,
    formMessage: editor.formMessage,
    catalogError: editor.catalogError,
    editingPermissions: editor.editingPermissions,
    permissionGroups: editor.permissionGroups,
    handleCreateRoleClick,
    handleSearchChange: list.handleSearchChange,
    handlePageChange: list.handlePageChange,
    handleDeleteRole,
    handleSubmitEdit: editor.handleSubmitEdit,
    closeEditFormPanel: editor.closeEditFormPanel,
    toggleEditingPermission: editor.toggleEditingPermission,
    selectAllEditingPermissions: editor.selectAllEditingPermissions,
    clearEditingPermissions: editor.clearEditingPermissions,
    setEditingName: editor.setEditingName,
  };
}
