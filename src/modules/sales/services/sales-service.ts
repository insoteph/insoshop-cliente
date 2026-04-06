import { apiFetch, type PagedResult } from "@/modules/core/lib/api-client";

export type Sale = {
  id: number;
  numeroOrden: string;
  tiendaId: number;
  tiendaNombre: string;
  metodoPagoNombre: string;
  estadoVentaNombre: string;
  subTotal: number;
  total: number;
  cantidadItems: number;
  totalLineas: number;
  observacion: string | null;
  createdAt: string;
};

type SalesQuery = {
  storeId: number;
  page?: number;
  pageSize?: number;
  search?: string;
  fechaDesde?: string;
  fechaHasta?: string;
};

function buildSalesQuery(params: SalesQuery) {
  const query = new URLSearchParams();

  query.set("page", String(params.page ?? 1));
  query.set("pageSize", String(params.pageSize ?? 10));
  query.set("tiendaId", String(params.storeId));

  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }

  if (params.fechaDesde) {
    query.set("fechaDesde", params.fechaDesde);
  }

  if (params.fechaHasta) {
    query.set("fechaHasta", params.fechaHasta);
  }

  return query.toString();
}

export async function fetchSales(params: SalesQuery) {
  const response = await apiFetch<PagedResult<Sale>>(
    `/ventas?${buildSalesQuery(params)}`,
    {
      storeId: params.storeId,
    }
  );

  return response.data;
}
