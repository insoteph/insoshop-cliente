import { apiFetch } from "@/modules/core/lib/api-client";
import type {
  Pais,
  PaisPageResult,
  PaisStatusFilter,
  SavePaisPayload,
} from "@/modules/paises/types/paises-types";

type PaisesQueryParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  estadoFiltro?: PaisStatusFilter;
};

function buildPaisesQuery(params: PaisesQueryParams = {}) {
  const query = new URLSearchParams();

  query.set("page", String(params.page ?? 1));
  query.set("pageSize", String(params.pageSize ?? 10));

  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }

  if (params.estadoFiltro && params.estadoFiltro !== "todos") {
    query.set("estadoFiltro", params.estadoFiltro);
  }

  return query.toString();
}

export async function fetchPaisesApi(params: PaisesQueryParams = {}) {
  return apiFetch<PaisPageResult>(`/paises?${buildPaisesQuery(params)}`);
}

export async function fetchPaisesActivosApi() {
  return apiFetch<Pais[]>("/paises/activos");
}

export async function createPaisApi(payload: SavePaisPayload) {
  return apiFetch("/paises", {
    method: "POST",
    body: payload,
  });
}

export async function updatePaisApi(id: number, payload: SavePaisPayload) {
  return apiFetch(`/paises/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export async function togglePaisEstadoApi(id: number) {
  return apiFetch(`/paises/${id}/estado`, {
    method: "PATCH",
  });
}
