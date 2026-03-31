import { apiFetch, type PagedResult } from "@/modules/core/lib/api-client";

export type Category = {
  id: number;
  nombre: string;
  tiendaId: number;
  tiendaNombre: string;
  estado: boolean;
};

export async function fetchCategories(storeId: number) {
  const response = await apiFetch<PagedResult<Category>>(
    "/api/categorias?page=1&pageSize=100",
    {
      storeId,
    }
  );

  return response.data.items;
}

export async function createCategory(
  storeId: number,
  payload: { nombre: string; estado: boolean }
) {
  return apiFetch("/api/categorias", {
    method: "POST",
    storeId,
    body: payload,
  });
}
