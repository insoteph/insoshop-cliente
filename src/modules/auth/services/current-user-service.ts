import { apiFetch } from "@/modules/core/lib/api-client";

export type CurrentUser = {
  nombre: string;
  rolName: string;
};

export async function fetchCurrentUser() {
  const response = await apiFetch<CurrentUser>("/api/usuarios/current-user");
  return response.data;
}
