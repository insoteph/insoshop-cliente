import { apiFetch, type PagedResult } from "@/modules/core/lib/api-client";

export type Category = {
  id: number;
  nombre: string;
  tiendaId: number;
  tiendaNombre: string;
  estado: boolean;
};

type CategoriesQuery = {
  storeId: number;
  page?: number;
  pageSize?: number;
  search?: string;
  estadoFiltro?: "activos" | "inactivos" | "todos";
};

function buildCategoriesQuery(params: CategoriesQuery) {
  const query = new URLSearchParams();

  query.set("page", String(params.page ?? 1));
  query.set("pageSize", String(params.pageSize ?? 10));
  query.set("tiendaId", String(params.storeId));

  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }

  if (params.estadoFiltro && params.estadoFiltro !== "todos") {
    query.set("estadoFiltro", params.estadoFiltro);
  }

  return query.toString();
}

export async function fetchCategories(params: CategoriesQuery) {
  const response = await apiFetch<PagedResult<Category>>(
    `/categorias?${buildCategoriesQuery(params)}`,
    {
      storeId: params.storeId,
    }
  );

  return response.data;
}

export async function createCategory(
  storeId: number,
  payload: { nombre: string; estado: boolean }
) {
  return apiFetch("/categorias", {
    method: "POST",
    storeId,
    body: payload,
  });
}

export async function updateCategory(
  categoryId: number,
  storeId: number,
  payload: { nombre: string; estado: boolean }
) {
  return apiFetch(`/categorias/${categoryId}`, {
    method: "PUT",
    storeId,
    body: payload,
  });
}

export async function toggleCategoryStatus(
  categoryId: number,
  storeId: number
) {
  return apiFetch(`/categorias/${categoryId}`, {
    method: "DELETE",
    storeId,
  });
}
