import { apiFetch } from "@/modules/core/lib/api-client";
import type {
  RoleDetail,
  RolePermission,
  RolesPageResult,
  RolesQueryParams,
} from "@/modules/roles/types/roles-types";

function buildRolesQuery(params: RolesQueryParams = {}) {
  const query = new URLSearchParams();

  query.set("page", String(params.page ?? 1));
  query.set("pageSize", String(params.pageSize ?? 10));

  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }

  return query.toString();
}

export async function fetchRolesApi(params: RolesQueryParams = {}) {
  return apiFetch<RolesPageResult>(`/role?${buildRolesQuery(params)}`);
}

export async function fetchRoleByIdApi(roleId: string) {
  return apiFetch<RoleDetail>(`/role/${roleId}`);
}

export async function createRoleApi(payload: { name: string }) {
  return apiFetch<{ id: string }>("/role", {
    method: "POST",
    body: payload,
  });
}

export async function updateRoleApi(roleId: string, payload: { name: string }) {
  return apiFetch<null>(`/role/${roleId}`, {
    method: "PUT",
    body: payload,
  });
}

export async function deleteRoleApi(roleId: string) {
  return apiFetch<null>(`/role/eliminar/${roleId}`, {
    method: "DELETE",
  });
}

export async function fetchPermissionsCatalogApi() {
  return apiFetch<string[]>("/permisos");
}

export async function fetchRolePermissionsApi(roleId: string) {
  return apiFetch<RolePermission[]>(`/permisos/rol/${roleId}`);
}

export async function assignPermissionsToRoleApi(
  roleId: string,
  permissions: string[]
) {
  return apiFetch<null>("/permisos/asignar", {
    method: "POST",
    body: {
      roleId,
      permissions,
    },
  });
}

export async function removePermissionsFromRoleApi(
  roleId: string,
  permissions: string[]
) {
  return apiFetch<null>("/permisos/remover", {
    method: "POST",
    body: {
      roleId,
      permissions,
    },
  });
}
