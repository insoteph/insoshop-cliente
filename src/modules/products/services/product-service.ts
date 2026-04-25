import { apiFetch, type PagedResult } from "@/modules/core/lib/api-client";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeArrayResponse<T>(data: unknown): T[] {
  if (Array.isArray(data)) {
    return data as T[];
  }

  if (isRecord(data) && Array.isArray(data.items)) {
    return data.items as T[];
  }

  return [];
}

export type ProductImagePayload = {
  url: string;
  orden: number;
  esPrincipal: boolean;
};

export type ProductAttributeValue = {
  id: number;
  atributoCatalogoValorId: number;
  valor: string;
  colorHexadecimal: string | null;
  orden: number;
};

export type ProductAttribute = {
  id: number;
  productoId: number;
  atributoCatalogoId: number;
  atributoCatalogoNombre: string;
  valores: ProductAttributeValue[];
};

export type ProductVariantValue = {
  productoAtributoId: number;
  atributoCatalogoNombre: string;
  atributoCatalogoValorId: number;
  valor: string;
  colorHexadecimal: string | null;
};

export type ProductVariant = {
  id: number;
  precio: number;
  cantidad: number;
  estado: boolean;
  urlImagenPrincipal: string | null;
  imagenes: string[];
  valores: ProductVariantValue[];
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

export type ProductDetail = Product & {
  atributos: ProductAttribute[];
  variantes: ProductVariant[];
  createdAt: string;
  createdBy: string | null;
  updatedAt: string;
  updatedBy: string | null;
};

type ProductsQuery = {
  storeId: number;
  page?: number;
  pageSize?: number;
  search?: string;
  categoriaId?: number | null;
  estadoFiltro?: "activos" | "inactivos" | "todos";
};

export type ProductBasePayload = {
  nombre: string;
  descripcion: string;
  categoriaId: number;
  estado: boolean;
};

export type ProductPayload = ProductBasePayload;

export type SaveProductAttributePayload = {
  atributoCatalogoId: number;
  atributoCatalogoValorIds: number[];
};

export type ProductAttributeDraftPayload = SaveProductAttributePayload;

export type SaveProductVariantPayload = {
  precio: number;
  cantidad: number;
  estado: boolean;
  urlImagen?: string | null;
  productoAtributoValorIds: number[];
};

export type ProductVariantPayload = SaveProductVariantPayload;

export type ProductVariantDraft = {
  key: string;
  id?: number;
  precio: string;
  cantidad: string;
  estado: boolean;
  urlImagen: string | null;
  valoresPorAtributo: Record<number, string>;
};

export type AttributeCatalog = {
  id: number;
  nombre: string;
  estado: boolean;
  cantidadValores: number;
};

export type AttributeCatalogValue = {
  id: number;
  atributoCatalogoId: number;
  nombre?: string;
  valor: string;
  colorHexadecimal: string | null;
  orden: number;
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

export async function fetchAttributeCatalogs(storeId?: number) {
  void storeId;

  const response = await apiFetch<PagedResult<AttributeCatalog>>(
    "/AtributosCatalogo?page=1&pageSize=200&estadoFiltro=todos",
  );

  return normalizeArrayResponse<AttributeCatalog>(response.data);
}

export async function fetchAttributeCatalogValues(
  storeId: number | undefined,
  attributeId: number,
) {
  void storeId;

  const response = await apiFetch<AttributeCatalogValue[]>(
    `/AtributosCatalogo/${attributeId}/valores`,
  );

  return response.data;
}

export async function fetchProducts(params: ProductsQuery) {
  const response = await apiFetch<PagedResult<Product>>(
    `/productos?${buildProductsQuery(params)}`,
    {
      storeId: params.storeId,
    },
  );

  return response.data;
}

export async function fetchProductById(productId: number, storeId: number) {
  const response = await apiFetch<ProductDetail>(`/productos/${productId}`, {
    storeId,
  });

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
    },
  );

  return response.data;
}

export async function createProduct(
  storeId: number,
  payload: ProductBasePayload,
) {
  const response = await apiFetch<{ id: number }>("/productos", {
    method: "POST",
    storeId,
    body: payload,
  });

  return response.data;
}

export async function updateProduct(
  productId: number,
  storeId: number,
  payload: ProductBasePayload,
) {
  return apiFetch("/productos/" + productId, {
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

export async function fetchProductAttributes(
  productId: number,
  storeId: number,
) {
  const response = await apiFetch<ProductAttribute[]>(
    `/productos/${productId}/atributos`,
    {
      storeId,
    },
  );

  return response.data;
}

export async function createProductAttribute(
  productId: number,
  storeId: number,
  payload: SaveProductAttributePayload,
) {
  return apiFetch(`/productos/${productId}/atributos`, {
    method: "POST",
    storeId,
    body: payload,
  });
}

export async function updateProductAttribute(
  productId: number,
  productAttributeId: number,
  storeId: number,
  payload: SaveProductAttributePayload,
) {
  return apiFetch(`/productos/${productId}/atributos/${productAttributeId}`, {
    method: "PUT",
    storeId,
    body: payload,
  });
}

export async function deleteProductAttribute(
  productId: number,
  productAttributeId: number,
  storeId: number,
) {
  return apiFetch(`/productos/${productId}/atributos/${productAttributeId}`, {
    method: "DELETE",
    storeId,
  });
}

export async function createProductVariants(
  productId: number,
  storeId: number,
  payload: { variantes: SaveProductVariantPayload[] },
) {
  const response = await apiFetch<ProductVariant[]>(
    `/productos/${productId}/variantes`,
    {
      method: "POST",
      storeId,
      body: payload,
    },
  );

  return response.data;
}

export async function updateProductVariant(
  productId: number,
  productVariantId: number,
  storeId: number,
  payload: SaveProductVariantPayload,
) {
  const response = await apiFetch<ProductVariant>(
    `/productos/${productId}/variantes/${productVariantId}`,
    {
      method: "PUT",
      storeId,
      body: payload,
    },
  );

  return response.data;
}

export async function toggleProductVariantStatus(
  productId: number,
  productVariantId: number,
  storeId: number,
  estado: boolean,
) {
  return apiFetch(
    `/productos/${productId}/variantes/${productVariantId}/estado`,
    {
      method: "PATCH",
      storeId,
      body: estado,
    },
  );
}

export async function deleteProductVariant(
  productId: number,
  productVariantId: number,
  storeId: number,
) {
  return apiFetch(`/productos/${productId}/variantes/${productVariantId}`, {
    method: "DELETE",
    storeId,
  });
}
