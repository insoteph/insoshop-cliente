"use client";

import { RoleEditForm } from "@/modules/roles/components/RoleEditForm";
import { RolePermissionsSidebar } from "@/modules/roles/components/RolePermissionsSidebar";
import { RolesManagementHeader } from "@/modules/roles/components/RolesManagementHeader";
import { RolesTable } from "@/modules/roles/components/RolesTable";
import { useRolesManagement } from "@/modules/roles/hooks/useRolesManagement";

export function RolesManagementView() {
  const {
    canCreateRole,
    canManagePermissions,
    roles,
    page,
    totalPages,
    totalRecords,
    search,
    isLoading,
    error,
    rowActions,
    selectedRoleId,
    selectedRoleName,
    selectedRolePermissions,
    isLoadingRolePermissions,
    rolePermissionsError,
    isEditFormMounted,
    isEditFormVisible,
    editingName,
    isSaving,
    formError,
    formMessage,
    catalogError,
    editingPermissions,
    permissionGroups,
    handleCreateRoleClick,
    handleSearchChange,
    handlePageChange,
    handleSubmitEdit,
    closeEditFormPanel,
    toggleEditingPermission,
    selectAllEditingPermissions,
    clearEditingPermissions,
    setEditingName,
  } = useRolesManagement();

  return (
    <section className="space-y-6">
      <RolesManagementHeader
        search={search}
        canCreateRole={canCreateRole}
        onSearchChange={handleSearchChange}
        onCreateRole={handleCreateRoleClick}
      />

      {error ? (
        <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
          {error}
        </p>
      ) : null}

      {formMessage ? (
        <p className="app-alert-success rounded-2xl px-4 py-3 text-sm">
          {formMessage}
        </p>
      ) : null}

      <RoleEditForm
        editingName={editingName}
        isEditFormVisible={isEditFormVisible}
        isEditFormMounted={isEditFormMounted}
        isSaving={isSaving}
        formError={formError}
        canManagePermissions={canManagePermissions}
        catalogError={catalogError}
        selectedPermissions={editingPermissions}
        permissionGroups={permissionGroups}
        onEditingNameChange={setEditingName}
        onClose={() => closeEditFormPanel(true)}
        onSubmit={handleSubmitEdit}
        onTogglePermission={toggleEditingPermission}
        onSelectAllPermissions={selectAllEditingPermissions}
        onClearPermissions={clearEditingPermissions}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
        <div className="space-y-4">
          <RolesTable
          roles={roles}
          isLoading={isLoading}
          page={page}
          totalPages={totalPages}
          totalRecords={totalRecords}
            rowActions={rowActions}
            onPageChange={handlePageChange}
          />
        </div>

        <RolePermissionsSidebar
          selectedRoleId={selectedRoleId}
          selectedRoleName={selectedRoleName}
          canManagePermissions={canManagePermissions}
          isLoadingRolePermissions={isLoadingRolePermissions}
          rolePermissionsError={rolePermissionsError}
          selectedRolePermissions={selectedRolePermissions}
        />
      </div>
    </section>
  );
}
