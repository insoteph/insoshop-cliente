import type { PagedResult } from "@/modules/core/lib/api-client";

export type Pais = {
  id: number;
  nombrePais: string;
  codigoPais: string;
  codigoTelefono: string;
  mascaraTelefono: string;
  monedaNombre: string;
  simboloMoneda: string;
  monedaCodigo: string;
  estado: boolean;
};

export type PaisPageResult = PagedResult<Pais>;

export type PaisStatusFilter = "activos" | "inactivos" | "todos";

export type PaisFormState = {
  nombrePais: string;
  codigoPais: string;
  codigoTelefono: string;
  mascaraTelefono: string;
  monedaNombre: string;
  simboloMoneda: string;
  monedaCodigo: string;
  estado: boolean;
};

export type SavePaisPayload = PaisFormState;
