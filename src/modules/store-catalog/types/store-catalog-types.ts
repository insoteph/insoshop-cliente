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

export type PublicStoreProductAttributeValue = {
  atributoCatalogoValorId: number;
  valor: string;
  colorHexadecimal: string | null;
  orden: number;
};

export type PublicStoreProductAttribute = {
  atributoCatalogoId: number;
  nombre: string;
  valores: PublicStoreProductAttributeValue[];
};

export type PublicStoreProductVariantValue = {
  atributoCatalogoId: number;
  atributoCatalogoNombre: string;
  atributoCatalogoValorId: number;
  valor: string;
  colorHexadecimal: string | null;
};

export type PublicStoreProductVariant = {
  id: number;
  precio: number;
  cantidad: number;
  estado: boolean;
  urlImagenPrincipal: string | null;
  imagenes: string[];
  valores: PublicStoreProductVariantValue[];
};

export type PublicStoreProductDetail = {
  id: number;
  nombre: string;
  descripcion: string;
  categoriaId: number;
  categoria: string;
  atributos: PublicStoreProductAttribute[];
  variantes: PublicStoreProductVariant[];
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
