export type CatalogAttributeStatusFilter = "activos" | "inactivos" | "todos";

export type CatalogAttributeFormValue = {
  id: string;
  catalogValueId: number | null;
  valor: string;
  colorHexadecimal: string;
  usaColor: boolean;
  orden: string;
};

export type CatalogAttributeFormState = {
  nombre: string;
  estado: boolean;
  valores: CatalogAttributeFormValue[];
};
