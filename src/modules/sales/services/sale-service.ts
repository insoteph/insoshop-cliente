import { apiFetch, type PagedResult } from "@/modules/core/lib/api-client";
import type { Product } from "@/modules/products/services/product-service";

export type PaymentMethod = {
  id: number;
  nombre: string;
  estado: boolean;
};

export type SaleState = {
  id: number;
  nombre: string;
};

export type SaleDetailInput = {
  productoId: number;
  cantidad: number;
};

export type PublicStore = {
  tiendaId: number;
  nombre: string;
  slug: string;
  telefono: string;
  moneda: string;
  logoUrl: string;
  productos: Array<{
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    cantidadDisponible: number;
    categoria: string;
    imagenes: string[];
  }>;
};

export async function fetchProductsForSale(storeId: number) {
  return apiFetch<PagedResult<Product>>("/api/productos?page=1&pageSize=100", {
    storeId,
  }).then((response) => response.data.items.filter((item) => item.estado));
}

export async function fetchPaymentMethods(storeId: number) {
  const response = await apiFetch<PagedResult<PaymentMethod>>(
    "/api/metodospago?page=1&pageSize=100",
    {
      storeId,
    }
  );

  return response.data.items.filter((method) => method.estado);
}

export async function fetchSaleStates() {
  const response = await apiFetch<PagedResult<SaleState>>(
    "/api/estadosventa?page=1&pageSize=100"
  );

  return response.data.items;
}

export async function createSale(payload: {
  tiendaId?: number;
  metodoPagoId: number;
  estadoVentaId: number;
  observacion?: string;
  detalles: SaleDetailInput[];
}) {
  return apiFetch<{
    id: number;
    numeroOrden: string;
    total: number;
  }>("/api/ventas", {
    method: "POST",
    auth: payload.tiendaId ? false : true,
    body: payload,
  });
}

export async function fetchPublicStore(slug: string) {
  const response = await apiFetch<PublicStore>(
    `/api/public/tiendas/${slug}/productos`,
    {
      auth: false,
    }
  );

  return response.data;
}
