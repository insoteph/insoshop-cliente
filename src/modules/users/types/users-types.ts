import type { PagedResult } from "@/modules/core/lib/api-client";

export type UserRecord = {
  id: string;
  username: string;
  email: string;
  telefono: string | null;
  status: boolean;
  changePassword: boolean;
  detalleUsuario: {
    nombres: string;
    apellidos: string;
    dni: string;
    fechaNac: string;
  } | null;
};

export type UserRole = {
  roleId: string;
  roleName: string;
};

export type UsersPageResult = PagedResult<UserRecord>;

export type UsersQueryParams = {
  storeId?: number | null;
  page?: number;
  pageSize?: number;
  search?: string;
  estadoFiltro?: "activos" | "inactivos" | "todos";
};

export type CreateUserPayload = {
  email: string;
  username: string;
  password: string;
  codigoPais: string;
  numeroTelefono: string;
  detalleUsuario: {
    nombres: string;
    apellidos: string;
    dni: string;
    fechaNac: string;
  };
};
