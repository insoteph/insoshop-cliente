import { apiFetch } from "@/modules/core/lib/api-client";
import type {
  CreateUserPayload,
  UserRole,
  UsersPageResult,
  UsersQueryParams,
} from "@/modules/users/types/users-types";

function buildUsersQuery(params: UsersQueryParams = {}) {
  const query = new URLSearchParams();

  query.set("page", String(params.page ?? 1));
  query.set("pageSize", String(params.pageSize ?? 10));

  if (params.storeId) {
    query.set("tiendaId", String(params.storeId));
  }

  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }

  if (params.estadoFiltro && params.estadoFiltro !== "todos") {
    query.set("estadoFiltro", params.estadoFiltro);
  }

  return query.toString();
}

export async function fetchUsers(params: UsersQueryParams = {}) {
  const response = await apiFetch<UsersPageResult>(
    `/usuarios?${buildUsersQuery(params)}`,
    {
      storeId: params.storeId ?? null,
    }
  );

  return response.data;
}

export async function fetchStoreUsers(params: UsersQueryParams & { storeId: number }) {
  return fetchUsers(params);
}

export async function fetchUserRoles(userId: string) {
  const response = await apiFetch<UserRole[]>(`/role/usuario/${userId}`);
  return response.data;
}

export async function assignRolesToUser(userId: string, roles: string[]) {
  if (roles.length === 0) {
    return;
  }

  await apiFetch<null>("/role/asignar-role", {
    method: "POST",
    body: {
      userId,
      roles,
    },
  });
}

export async function removeRolesFromUser(userId: string, roles: string[]) {
  if (roles.length === 0) {
    return;
  }

  await apiFetch<null>("/role/desasignar-role", {
    method: "POST",
    body: {
      userId,
      roles,
    },
  });
}

export async function syncUserRoles(payload: {
  userId: string;
  currentRoles: string[];
  nextRoles: string[];
}) {
  const rolesToAssign = payload.nextRoles.filter(
    (roleName) => !payload.currentRoles.includes(roleName)
  );
  const rolesToRemove = payload.currentRoles.filter(
    (roleName) => !payload.nextRoles.includes(roleName)
  );

  await assignRolesToUser(payload.userId, rolesToAssign);
  await removeRolesFromUser(payload.userId, rolesToRemove);
}

export async function createUser(payload: CreateUserPayload) {
  const response = await apiFetch<{ id: string }>("/usuarios", {
    method: "POST",
    body: payload,
  });

  return response.data;
}

export async function toggleUserStatus(
  userId: string,
  storeId?: number | null
) {
  return apiFetch(`/usuarios/${userId}`, {
    method: "DELETE",
    storeId: storeId ?? null,
  });
}
