import type { PagedResult } from "@/modules/core/lib/api-client";

export type Tienda = {
  id: number;
  nombre: string;
  slug: string;
  telefono: string;
  moneda: string;
  logoUrl: string;
  estado: boolean;
  createdAt: string;
};

export type TiendasPageResult = PagedResult<Tienda>;

export type TiendaDetalle = Tienda & {
  createdBy: string | null;
  updatedAt: string;
  updatedBy: string | null;
};

export type TiendaDisponible = {
  id: number;
  nombre: string;
  slug: string;
  logoUrl: string;
  esPrincipal: boolean;
};

export type TiendasQueryParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  estadoFiltro?: "activos" | "inactivos" | "todos";
  tiendaId?: number | null;
};

export type TiendaUsuario = {
  usuarioId: string;
  username: string;
  email: string;
  telefono: string | null;
  estado: boolean;
  esPrincipal: boolean;
  detalleUsuario: {
    nombres: string;
    apellidos: string;
    dni: string;
    fechaNac: string;
  } | null;
};

export type TiendaUsuariosPageResult = PagedResult<TiendaUsuario>;

export type TiendaUsuariosQueryParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  estadoFiltro?: "activos" | "inactivos" | "todos";
};
