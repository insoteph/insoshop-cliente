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

export type ProductVariantImagePayload = {
  url: string;
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

export type ProductPayload = {
  nombre: string;
  descripcion: string;
  categoriaId: number;
  estado: boolean;
};

export type ProductAttributeDraftPayload = {
  atributoCatalogoId: number;
  atributoCatalogoValorIds: number[];
};

export type ProductAttributeValue = {
  id: number;
  atributoCatalogoValorId: number;
  valor: string;
  colorHexadecimal?: string | null;
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
  colorHexadecimal?: string | null;
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

export type ProductDetail = Product & {
  atributos: ProductAttribute[];
  variantes: ProductVariant[];
};

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
  valor?: string;
  estado?: boolean;
  colorHexadecimal?: string | null;
  orden?: number;
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

export type SaveProductAttributePayload = {
  atributoCatalogoId: number;
  atributoCatalogoValorIds: number[];
};

export type SaveProductVariantPayload = {
  precio: number;
  cantidad: number;
  estado: boolean;
  urlImagen?: string | null;
  productoAtributoValorIds: number[];
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
    },
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
    },
  );

  return response.data;
}

export async function fetchAttributeCatalogs(storeId: number) {
  const response = await apiFetch<
    PagedResult<AttributeCatalog> | AttributeCatalog[]
  >("/AtributosCatalogo?page=1&pageSize=1000", {
    storeId,
  });

  return normalizeArrayResponse<AttributeCatalog>(response.data);
}

export async function fetchAttributeCatalogValues(
  storeId: number,
  attributeCatalogId: number,
) {
  const response = await apiFetch<AttributeCatalogValue[]>(
    `/AtributosCatalogo/${attributeCatalogId}/valores`,
    {
      storeId,
    },
  );

  return normalizeArrayResponse<AttributeCatalogValue>(response.data);
}

export async function fetchProductAttributes(
  storeId: number,
  productId: number,
) {
  const response = await apiFetch<
    PagedResult<ProductAttribute> | ProductAttribute[]
  >(`/productos/${productId}/atributos`, {
    storeId,
  });

  return normalizeArrayResponse<ProductAttribute>(response.data);
}

export async function fetchProductById(storeId: number, productId: number) {
  const response = await apiFetch<ProductDetail>(`/productos/${productId}`, {
    storeId,
  });

  return response.data;
}

export async function createProductAttribute(
  storeId: number,
  productId: number,
  payload: ProductAttributeDraftPayload,
) {
  return apiFetch(`/productos/${productId}/atributos`, {
    method: "POST",
    storeId,
    body: payload,
  });
}

export async function updateProductAttribute(
  storeId: number,
  productId: number,
  productAttributeId: number,
  payload: ProductAttributeDraftPayload,
) {
  return apiFetch(`/productos/${productId}/atributos/${productAttributeId}`, {
    method: "PUT",
    storeId,
    body: payload,
  });
}

export async function deleteProductAttribute(
  storeId: number,
  productId: number,
  productAttributeId: number,
) {
  return apiFetch(`/productos/${productId}/atributos/${productAttributeId}`, {
    method: "DELETE",
    storeId,
  });
}

export type ProductVariantPayload = {
  precio: number;
  cantidad: number;
  estado: boolean;
  urlImagen?: string | null;
  productoAtributoValorIds: number[];
};

export type ProductVariantsPayload = {
  variantes: ProductVariantPayload[];
};

export async function createProductVariants(
  storeId: number,
  productId: number,
  payload: ProductVariantsPayload,
) {
  return apiFetch(`/productos/${productId}/variantes`, {
    method: "POST",
    storeId,
    body: payload,
  });
}

export async function updateProductVariant(
  storeId: number,
  productId: number,
  productVariantId: number,
  payload: ProductVariantPayload,
) {
  return apiFetch(`/productos/${productId}/variantes/${productVariantId}`, {
    method: "PUT",
    storeId,
    body: payload,
  });
}

export async function deleteProductVariant(
  storeId: number,
  productId: number,
  productVariantId: number,
) {
  return apiFetch(`/productos/${productId}/variantes/${productVariantId}`, {
    method: "DELETE",
    storeId,
  });
}

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
