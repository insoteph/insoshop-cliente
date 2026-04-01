import type { PagedResult } from "@/modules/core/lib/api-client";

export type Tienda = {
  id: number;
  nombre: string;
  slug: string;
  telefono: string;
  moneda: string;
  logoUrl: string;
  estado: boolean;
};

export type TiendasPageResult = PagedResult<Tienda>;
