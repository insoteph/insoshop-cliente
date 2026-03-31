import { fetchTiendasApi } from "@/modules/tiendas/api/tiendas-api";

export async function fetchTiendas(page = 1, pageSize = 10) {
  const response = await fetchTiendasApi(page, pageSize);
  return response.data;
}
