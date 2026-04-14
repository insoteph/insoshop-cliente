import { apiFetch, type PagedResult } from "@/modules/core/lib/api-client";

export type PaymentMethod = {
  id: number;
  nombre: string;
  estado: boolean;
  tiendaId?: number;
  tiendaNombre?: string;
};

type FetchPaymentMethodsParams = {
  storeId: number;
  hasGlobalAccess: boolean;
  page?: number;
  pageSize?: number;
  search?: string;
  estadoFiltro?: "activos" | "inactivos" | "todos";
};

function buildPaymentMethodsQuery(params: FetchPaymentMethodsParams) {
  const query = new URLSearchParams();

  query.set("page", String(params.page ?? 1));
  query.set("pageSize", String(params.pageSize ?? 10));

  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }

  if (params.estadoFiltro && params.estadoFiltro !== "todos") {
    query.set("estadoFiltro", params.estadoFiltro);
  }

  if (params.hasGlobalAccess) {
    query.set("tiendaId", String(params.storeId));
  }

  return query.toString();
}

export async function fetchPaymentMethods(params: FetchPaymentMethodsParams) {
  const query = buildPaymentMethodsQuery(params);
  const response = await apiFetch<PagedResult<PaymentMethod>>(
    `/metodospago?${query}`,
    {
      storeId: params.storeId,
    },
  );

  return response.data;
}

export async function togglePaymentMethodStatus(methodId: number, storeId: number) {
  return apiFetch(`/metodospago/${methodId}`, {
    method: "DELETE",
    storeId,
  });
}

