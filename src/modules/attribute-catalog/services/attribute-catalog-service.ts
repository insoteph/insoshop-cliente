import { apiFetch, type PagedResult } from "@/modules/core/lib/api-client";

export type CatalogAttributeValueInput = {
  valor: string;
  colorHexadecimal?: string | null;
  orden: number;
};

export type CatalogAttributeValue = {
  id: number;
  atributoCatalogoId: number;
  valor: string;
  colorHexadecimal: string | null;
  orden: number;
};

export type CatalogAttribute = {
  id: number;
  nombre: string;
  estado: boolean;
  cantidadValores: number;
};

export type CatalogAttributeDetail = {
  id: number;
  nombre: string;
  estado: boolean;
  valores: CatalogAttributeValue[];
  createdAt: string;
  createdBy: string | null;
  updatedAt: string;
  updatedBy: string | null;
};

type CatalogAttributesQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  estadoFiltro?: "activos" | "inactivos" | "todos";
};

export type SaveCatalogAttributePayload = {
  nombre: string;
  estado: boolean;
  valores: CatalogAttributeValueInput[];
};

function buildCatalogAttributesQuery(params: CatalogAttributesQuery) {
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

export async function fetchCatalogAttributes(params: CatalogAttributesQuery) {
  const response = await apiFetch<PagedResult<CatalogAttribute>>(
    `/AtributosCatalogo?${buildCatalogAttributesQuery(params)}`,
  );

  return response.data;
}

export async function fetchCatalogAttributeById(attributeId: number) {
  const response = await apiFetch<CatalogAttributeDetail>(
    `/AtributosCatalogo/${attributeId}`,
  );

  return response.data;
}

export async function createCatalogAttribute(payload: SaveCatalogAttributePayload) {
  return apiFetch<{ id: number }>("/AtributosCatalogo", {
    method: "POST",
    body: payload,
  });
}

export async function updateCatalogAttribute(
  attributeId: number,
  payload: SaveCatalogAttributePayload,
) {
  return apiFetch(`/AtributosCatalogo/${attributeId}`, {
    method: "PUT",
    body: payload,
  });
}

export async function toggleCatalogAttributeStatus(attributeId: number) {
  return apiFetch(`/AtributosCatalogo/${attributeId}/estado`, {
    method: "PATCH",
  });
}
