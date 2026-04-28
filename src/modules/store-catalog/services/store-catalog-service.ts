import { apiFetch } from "@/modules/core/lib/api-client";
import type {
  PublicStoreCategory,
  PublicStoreProductDetail,
  PublicStoreProductsData,
  PublicStoreProductsQuery,
} from "@/modules/store-catalog/types/store-catalog-types";

function buildProductsQuery(params: PublicStoreProductsQuery) {
  const query = new URLSearchParams();

  query.set("page", String(params.page ?? 1));
  query.set("pageSize", String(params.pageSize ?? 10));

  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }

  if (params.categorias && params.categorias > 0) {
    query.set("categorias", String(params.categorias));
  }

  return query.toString();
}

export async function fetchPublicStoreProducts(
  params: PublicStoreProductsQuery,
) {
  const query = buildProductsQuery(params);
  const response = await apiFetch<PublicStoreProductsData>(
    `/store/${params.slug}/productos?${query}`,
    {
      auth: false,
    },
  );

  return response.data;
}

export async function fetchPublicStoreCategories(slug: string) {
  const response = await apiFetch<PublicStoreCategory[]>(
    `/store/${slug}/categorias`,
    {
      auth: false,
    },
  );

  return response.data;
}

export async function fetchPublicStoreProductById(
  slug: string,
  productId: number,
) {
  const response = await apiFetch<PublicStoreProductDetail>(
    `/store/${slug}/productos/${productId}`,
    {
      auth: false,
    },
  );

  return response.data;
}
