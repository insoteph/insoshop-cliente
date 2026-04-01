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
  categoriaNombre: string;
  imagenes: ProductImagePayload[];
};

export async function fetchProducts(storeId: number) {
  const response = await apiFetch<PagedResult<Product>>(
    "/productos?page=1&pageSize=100",
    {
      storeId,
    }
  );

  return response.data.items;
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

export async function createProduct(
  storeId: number,
  payload: {
    nombre: string;
    descripcion: string;
    categoriaId: number;
    precio: number;
    cantidad: number;
    estado: boolean;
    imagenes: ProductImagePayload[];
  }
) {
  return apiFetch("/productos", {
    method: "POST",
    storeId,
    body: payload,
  });
}

