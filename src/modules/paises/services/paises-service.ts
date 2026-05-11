import {
  createPaisApi,
  fetchPaisesActivosApi,
  fetchPaisesApi,
  togglePaisEstadoApi,
  updatePaisApi,
} from "@/modules/paises/api/paises-api";
import type {
  Pais,
  PaisPageResult,
  PaisStatusFilter,
  SavePaisPayload,
} from "@/modules/paises/types/paises-types";

export async function fetchPaises(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  estadoFiltro?: PaisStatusFilter;
} = {}) {
  const response = await fetchPaisesApi(params);
  return response.data as PaisPageResult;
}

export async function fetchPaisesActivos(): Promise<Pais[]> {
  const response = await fetchPaisesActivosApi();
  return response.data;
}

export async function createPais(payload: SavePaisPayload) {
  return createPaisApi(payload);
}

export async function updatePais(id: number, payload: SavePaisPayload) {
  return updatePaisApi(id, payload);
}

export async function togglePaisEstado(id: number) {
  return togglePaisEstadoApi(id);
}
