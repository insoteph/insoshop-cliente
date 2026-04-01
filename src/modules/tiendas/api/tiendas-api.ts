import { apiFetch } from "@/modules/core/lib/api-client";
import type { TiendasPageResult } from "@/modules/tiendas/types/tiendas-types";

export async function fetchTiendasApi(page = 1, pageSize = 10) {
  return apiFetch<TiendasPageResult>(
    `/Tiendas?page=${page}&pageSize=${pageSize}`
  );
}
