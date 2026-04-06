import {
  fetchTiendaByIdApi,
  fetchTiendasApi,
  updateTiendaApi,
} from "@/modules/tiendas/api/tiendas-api";
import type { TiendasQueryParams } from "@/modules/tiendas/types/tiendas-types";

export async function fetchTiendas(params: TiendasQueryParams = {}) {
  const response = await fetchTiendasApi(params);
  return response.data;
}

export async function fetchTiendaById(tiendaId: number) {
  const response = await fetchTiendaByIdApi(tiendaId);
  return response.data;
}

export async function updateTienda(
  tiendaId: number,
  payload: {
    nombre: string;
    telefono: string;
    moneda: string;
    logoUrl: string;
    estado: boolean;
  }
) {
  return updateTiendaApi(tiendaId, payload);
}
