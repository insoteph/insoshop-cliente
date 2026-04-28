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

export type SaleDetailItem = {
  productoVarianteId: number;
  nombreProducto: string;
  urlImagen: string | null;
  cantidad: number;
  precioUnitario: number;
  subTotal: number;
  valores: SaleDetailAttribute[];
};

export type SaleDetailAttribute = {
  atributoCatalogoId: number;
  atributoCatalogoNombre: string;
  atributoCatalogoValorId: number;
  valor: string;
};

export type SaleDetail = {
  id: number;
  numeroOrden: string;
  tiendaId: number;
  tiendaNombre: string;
  clienteId: number | null;
  clienteNombreCompleto: string;
  clienteTelefono: string;
  metodoPagoNombre: string;
  estadoVentaNombre: string;
  tipoEntrega: string;
  direccion: string | null;
  observacion: string | null;
  subTotal: number;
  total: number;
  createdAt: string;
  detalles: SaleDetailItem[];
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

export async function fetchSaleDetail(saleId: number, storeId: number) {
  const response = await apiFetch<SaleDetail>(`/ventas/${saleId}`, {
    storeId,
  });

  return response.data;
}

export async function updateSaleStatus(
  saleId: number,
  storeId: number,
  estado: "Completado" | "Cancelado",
) {
  const response = await apiFetch<null>(`/ventas/${saleId}/estado`, {
    method: "PATCH",
    storeId,
    body: {
      estado,
    },
  });

  return response;
}
