import { apiFetch, type ApiResponse } from "@/modules/core/lib/api-client";

export type PublicPaymentMethod = {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
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
  clienteId: number;
  tipoEntrega: "RecogerEnLocal" | "Domicilio";
  direccion: string;
  observacion: string;
  detalles: Array<{
    productoVarianteId: number;
    cantidad: number;
  }>;
};

export async function fetchPublicPaymentMethods(slug: string) {
  const encodedSlug = encodeURIComponent(slug);
  const endpoints = [
    `/public/stores/${encodedSlug}/payment-methods`,
    `/public/tiendas/${encodedSlug}/payment-methods`,
    `/store/${encodedSlug}/payment-methods`,
  ];

  for (const endpoint of endpoints) {
    const result = await tryFetchPublicPaymentMethods(endpoint);
    if (result) {
      return result.filter((method) => method.activo);
    }
  }

  throw new Error("No se pudieron cargar los metodos de pago de la tienda.");
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

const DEFAULT_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "http://localhost:7166/api";

function buildApiUrl(path: string) {
  const normalizedBase = DEFAULT_API_BASE_URL.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

async function tryFetchPublicPaymentMethods(path: string) {
  const response = await fetch(buildApiUrl(path), {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  let payload: unknown = null;

  try {
    payload = await response.json();
  } catch {
    if (!response.ok) {
      throw new Error("No se pudo procesar la respuesta de metodos de pago.");
    }

    throw new Error("La API devolvio una respuesta invalida para metodos de pago.");
  }

  if (!response.ok) {
    if (
      typeof payload === "object" &&
      payload !== null &&
      "message" in payload &&
      typeof (payload as { message?: unknown }).message === "string"
    ) {
      throw new Error((payload as { message: string }).message);
    }

    throw new Error("No se pudieron cargar los metodos de pago de la tienda.");
  }

  const apiPayload = payload as ApiResponse<PublicPaymentMethod[]>;
  return Array.isArray(apiPayload.data) ? apiPayload.data : [];
}
