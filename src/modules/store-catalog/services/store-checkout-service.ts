import { apiFetch } from "@/modules/core/lib/api-client";

export type PublicPaymentMethod = {
  id: number;
  nombre: string;
  estado: boolean;
};

export type CreateClientPayload = {
  nombreCompleto: string;
  telefono: string;
  tiendaId?: number;
};

export type CreatedClient = {
  id: number;
  nombreCompleto: string;
  telefono: string;
};

export type CreateSalePayload = {
  tiendaId: number;
  metodoPagoId: number;
  estadoVentaId: number;
  clienteId: number;
  tipoEntrega: "RecogerEnLocal" | "Domicilio";
  direccion: string;
  observacion: string;
  detalles: Array<{
    productoId: number;
    cantidad: number;
  }>;
};

export async function fetchPublicPaymentMethods(tiendaId: number) {
  const query = new URLSearchParams();
  query.set("tiendaId", String(tiendaId));
  query.set("estadoFiltro", "activos");
  query.set("page", "1");
  query.set("pageSize", "100");

  const response = await apiFetch<{
    items: PublicPaymentMethod[];
  }>(`/metodospago?${query.toString()}`, {
    auth: false,
  });

  return response.data.items ?? [];
}

export async function createPublicClient(payload: CreateClientPayload) {
  const response = await apiFetch<CreatedClient>("/clientes", {
    method: "POST",
    auth: false,
    body: payload,
  });

  return response.data;
}

export async function createPublicSale(payload: CreateSalePayload) {
  const response = await apiFetch<{ id: number; numeroOrden?: string }>("/ventas", {
    method: "POST",
    auth: false,
    body: payload,
  });

  return response.data;
}

