import { apiFetch, type PagedResult } from "@/modules/core/lib/api-client";

export type ProductImagePayload = {
  url: string;
  orden: number;
  esPrincipal: boolean;
};

export type Product = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  cantidad: number;
  estado: boolean;
  categoriaId: number;
  categoriaNombre: string;
  tiendaId: number;
  tiendaNombre: string;
  imagenes: ProductImagePayload[];
};

type ProductsQuery = {
  storeId: number;
  page?: number;
  pageSize?: number;
  search?: string;
  categoriaId?: number | null;
  estadoFiltro?: "activos" | "inactivos" | "todos";
};

function buildProductsQuery(params: ProductsQuery) {
  const query = new URLSearchParams();

  query.set("page", String(params.page ?? 1));
  query.set("pageSize", String(params.pageSize ?? 10));
  query.set("tiendaId", String(params.storeId));

  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }

  if (params.categoriaId) {
    query.set("categoriaId", String(params.categoriaId));
  }

  if (params.estadoFiltro && params.estadoFiltro !== "todos") {
    query.set("estadoFiltro", params.estadoFiltro);
  }

  return query.toString();
}

export async function fetchProducts(params: ProductsQuery) {
  const response = await apiFetch<PagedResult<Product>>(
    `/productos?${buildProductsQuery(params)}`,
    {
      storeId: params.storeId,
    }
  );

  return response.data;
}

export async function uploadProductImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiFetch<{ fileName: string; url: string }>(
    "/product-images",
    {
      method: "POST",
      body: formData,
    }
  );

  return response.data;
}

type ProductPayload = {
  nombre: string;
  descripcion: string;
  categoriaId: number;
  precio: number;
  cantidad: number;
  estado: boolean;
  imagenes: ProductImagePayload[];
};

export async function createProduct(storeId: number, payload: ProductPayload) {
  return apiFetch("/productos", {
    method: "POST",
    storeId,
    body: payload,
  });
}

export async function updateProduct(
  productId: number,
  storeId: number,
  payload: ProductPayload
) {
  return apiFetch(`/productos/${productId}`, {
    method: "PUT",
    storeId,
    body: payload,
  });
}

export async function toggleProductStatus(productId: number, storeId: number) {
  return apiFetch(`/productos/${productId}`, {
    method: "DELETE",
    storeId,
  });
}
