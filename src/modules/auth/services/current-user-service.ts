import { apiFetch } from "@/modules/core/lib/api-client";
import type { TiendaDisponible } from "@/modules/tiendas/types/tiendas-types";

export type CurrentUser = {
  nombre: string;
  rolName: string;
  tieneAccesoGlobal: boolean;
  tiendaPrincipalId: number | null;
  permisos: string[];
  tiendas: TiendaDisponible[];
};

export async function fetchCurrentUser() {
  const response = await apiFetch<CurrentUser>("/usuarios/current-user");
  return response.data;
}

export function hasPermission(
  currentUser: CurrentUser | null,
  permission: string
) {
  return currentUser?.permisos.includes(permission) ?? false;
}
