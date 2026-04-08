import {
  assignUsuarioTiendaApi,
  fetchTiendaByIdApi,
  fetchTiendaUsuariosApi,
  fetchTiendasApi,
  unassignUsuarioTiendaApi,
  updateTiendaApi,
} from "@/modules/tiendas/api/tiendas-api";
import type {
  TiendasQueryParams,
  TiendaUsuariosQueryParams,
} from "@/modules/tiendas/types/tiendas-types";

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

export async function toggleTiendaStatus(
  tiendaId: number,
  payload: {
    nombre: string;
    telefono: string;
    moneda: string;
    logoUrl: string;
    estado: boolean;
  }
) {
  return updateTiendaApi(tiendaId, {
    ...payload,
    estado: !payload.estado,
  });
}

export async function fetchTiendaUsuarios(
  tiendaId: number,
  params: TiendaUsuariosQueryParams = {}
) {
  const response = await fetchTiendaUsuariosApi(tiendaId, params);
  return response.data;
}

export async function assignUsuarioTienda(tiendaId: number, usuarioId: string) {
  return assignUsuarioTiendaApi(tiendaId, usuarioId);
}

export async function unassignUsuarioTienda(
  tiendaId: number,
  usuarioId: string
) {
  return unassignUsuarioTiendaApi(tiendaId, usuarioId);
}
