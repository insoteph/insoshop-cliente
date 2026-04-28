import {
  assignPermissionsToRoleApi,
  createRoleApi,
  deleteRoleApi,
  fetchPermissionsCatalogApi,
  fetchRoleByIdApi,
  fetchRolePermissionsApi,
  fetchRolesApi,
  removePermissionsFromRoleApi,
  updateRoleApi,
} from "@/modules/roles/api/roles-api";
import type { RolesQueryParams } from "@/modules/roles/types/roles-types";

export async function fetchRoles(params: RolesQueryParams = {}) {
  const response = await fetchRolesApi(params);
  return response.data;
}

export async function fetchRoleById(roleId: string) {
  const response = await fetchRoleByIdApi(roleId);
  return response.data;
}

export async function fetchPermissionsCatalog() {
  const response = await fetchPermissionsCatalogApi();
  return response.data;
}

export async function fetchRolePermissions(roleId: string) {
  const response = await fetchRolePermissionsApi(roleId);
  return response.data;
}

export async function createRoleWithPermissions(payload: {
  name: string;
  permissions: string[];
}) {
  const roleResponse = await createRoleApi({ name: payload.name });
  const roleId = roleResponse.data.id;

  if (payload.permissions.length === 0) {
    return roleId;
  }

  try {
    await assignPermissionsToRoleApi(roleId, payload.permissions);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudieron asignar permisos.";
    throw new Error(`Rol creado, pero la asignación de permisos falló: ${message}`);
  }

  return roleId;
}

export async function deleteRole(roleId: string) {
  await deleteRoleApi(roleId);
}

export async function updateRole(payload: { roleId: string; name: string }) {
  await updateRoleApi(payload.roleId, { name: payload.name });
}

export async function syncRolePermissions(payload: {
  roleId: string;
  currentPermissions: string[];
  nextPermissions: string[];
}) {
  const permissionsToAssign = payload.nextPermissions.filter(
    (permissionValue) => !payload.currentPermissions.includes(permissionValue)
  );
  const permissionsToRemove = payload.currentPermissions.filter(
    (permissionValue) => !payload.nextPermissions.includes(permissionValue)
  );

  if (permissionsToAssign.length > 0) {
    await assignPermissionsToRoleApi(payload.roleId, permissionsToAssign);
  }

  if (permissionsToRemove.length > 0) {
    await removePermissionsFromRoleApi(payload.roleId, permissionsToRemove);
  }
}
