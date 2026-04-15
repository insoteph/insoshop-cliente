import type { PagedResult } from "@/modules/core/lib/api-client";

export type PublicStoreSummary = {
  tiendaId: number;
  nombre: string;
  slug: string;
  telefono: string;
  moneda: string;
  logoUrl: string;
};

export type PublicStoreCategory = {
  id: number;
  nombre: string;
};

export type PublicStoreProduct = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  cantidadDisponible: number;
  categoria: string;
  imagenes: string[];
};

export type PublicStoreProductsData = {
  tienda: PublicStoreSummary;
  productos: PagedResult<PublicStoreProduct>;
};

export type PublicStoreProductsQuery = {
  slug: string;
  page?: number;
  pageSize?: number;
  search?: string;
  categorias?: number | null;
};
