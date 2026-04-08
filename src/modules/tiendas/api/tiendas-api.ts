import { apiFetch } from "@/modules/core/lib/api-client";
import type {
  TiendaDetalle,
  TiendasPageResult,
  TiendasQueryParams,
  TiendaUsuariosPageResult,
  TiendaUsuariosQueryParams,
} from "@/modules/tiendas/types/tiendas-types";

function buildTiendasQuery(params: TiendasQueryParams = {}) {
  const query = new URLSearchParams();

  query.set("page", String(params.page ?? 1));
  query.set("pageSize", String(params.pageSize ?? 10));

  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }

  if (params.estadoFiltro && params.estadoFiltro !== "todos") {
    query.set("estadoFiltro", params.estadoFiltro);
  }

  if (params.tiendaId) {
    query.set("tiendaId", String(params.tiendaId));
  }

  return query.toString();
}

function buildTiendaUsuariosQuery(params: TiendaUsuariosQueryParams = {}) {
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

export async function fetchTiendasApi(params: TiendasQueryParams = {}) {
  return apiFetch<TiendasPageResult>(`/tiendas?${buildTiendasQuery(params)}`, {
    storeId: params.tiendaId ?? null,
  });
}

export async function fetchTiendaByIdApi(tiendaId: number) {
  return apiFetch<TiendaDetalle>(`/tiendas/${tiendaId}`);
}

export async function updateTiendaApi(
  tiendaId: number,
  payload: {
    nombre: string;
    telefono: string;
    moneda: string;
    logoUrl: string;
    estado: boolean;
  }
) {
  return apiFetch(`/tiendas/${tiendaId}`, {
    method: "PUT",
    body: payload,
  });
}

export async function fetchTiendaUsuariosApi(
  tiendaId: number,
  params: TiendaUsuariosQueryParams = {}
) {
  return apiFetch<TiendaUsuariosPageResult>(
    `/tiendas/${tiendaId}/usuarios?${buildTiendaUsuariosQuery(params)}`,
    {
      storeId: tiendaId,
    }
  );
}

export async function assignUsuarioTiendaApi(
  tiendaId: number,
  usuarioId: string
) {
  return apiFetch("/tiendas/asignar-usuario", {
    method: "POST",
    storeId: tiendaId,
    body: {
      tiendaId,
      usuarioId,
    },
  });
}

export async function unassignUsuarioTiendaApi(
  tiendaId: number,
  usuarioId: string
) {
  return apiFetch("/tiendas/desasignar-usuario", {
    method: "POST",
    storeId: tiendaId,
    body: {
      tiendaId,
      usuarioId,
    },
  });
}
