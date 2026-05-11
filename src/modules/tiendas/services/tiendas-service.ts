import {
  assignUsuarioTiendaApi,
  createTiendaApi,
  fetchTiendaByIdApi,
  fetchPaisesApi,
  fetchTiendaUsuariosApi,
  fetchTiendasApi,
  unassignUsuarioTiendaApi,
  deleteTiendaLogoApi,
  updateTiendaLogoApi,
  updateTiendaApi,
} from "@/modules/tiendas/api/tiendas-api";
import type {
  PaisTelefono,
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

export async function createTienda(payload: {
  nombre: string;
  subdominio?: string;
  telefono: string;
  codigoPais: string;
  estado: boolean;
}) {
  return createTiendaApi(payload);
}

export async function updateTienda(
  tiendaId: number,
  payload: {
    nombre: string;
    subdominio?: string;
    telefono: string;
    codigoPais: string;
    estado: boolean;
  }
) {
  return updateTiendaApi(tiendaId, payload);
}

export async function toggleTiendaStatus(
  tiendaId: number,
  payload: {
    nombre: string;
    subdominio?: string;
    telefono: string;
    codigoPais: string;
    estado: boolean;
  }
) {
  return updateTiendaApi(tiendaId, {
    ...payload,
    estado: !payload.estado,
  });
}

export async function uploadTiendaLogo(tiendaId: number, file: File) {
  return updateTiendaLogoApi(tiendaId, file);
}

export async function deleteTiendaLogo(tiendaId: number) {
  return deleteTiendaLogoApi(tiendaId);
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

export async function fetchPaises(): Promise<PaisTelefono[]> {
  const response = await fetchPaisesApi();
  return response.data;
}
