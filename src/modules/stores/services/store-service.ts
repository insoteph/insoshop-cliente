import { apiFetch } from "@/modules/core/lib/api-client";

export type StoreOption = {
  id: number;
  nombre: string;
  slug: string;
  logoUrl: string;
  esPrincipal: boolean;
};

export async function fetchAvailableStores() {
  const response = await apiFetch<StoreOption[]>("/tiendas/disponibles");
  return response.data;
}

export async function fetchOperativeStore() {
  const response = await apiFetch<StoreOption>("/tiendas/operativa");
  return response.data;
}

