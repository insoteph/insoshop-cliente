import type {
  CatalogAttributeDetail,
  SaveCatalogAttributePayload,
} from "@/modules/attribute-catalog/services/attribute-catalog-service";
import {
  type CatalogAttributeFormState,
  type CatalogAttributeFormValue,
} from "@/modules/attribute-catalog/types/catalog-attribute-form.types";

export function createEmptyCatalogAttributeFormValue(
  ordinal = 1,
): CatalogAttributeFormValue {
  return {
    id: `value-${ordinal}-${Date.now()}`,
    catalogValueId: null,
    valor: "",
    colorHexadecimal: "#000000",
    usaColor: false,
    orden: String(ordinal),
  };
}

export function createInitialCatalogAttributeFormState(): CatalogAttributeFormState {
  return {
    nombre: "",
    estado: true,
    valores: [createEmptyCatalogAttributeFormValue()],
  };
}

export function mapCatalogAttributeDetailToFormState(
  detail: CatalogAttributeDetail,
): CatalogAttributeFormState {
  return {
    nombre: detail.nombre,
    estado: detail.estado,
    valores:
      detail.valores.length > 0
        ? detail.valores.map((value) => ({
            id: `value-${value.id}`,
            catalogValueId: value.id,
            valor: value.valor,
            colorHexadecimal: value.colorHexadecimal ?? "#000000",
            usaColor: Boolean(value.colorHexadecimal),
            orden: String(value.orden),
          }))
        : [createEmptyCatalogAttributeFormValue()],
  };
}

export function mapCatalogAttributeFormToPayload(
  form: CatalogAttributeFormState,
): SaveCatalogAttributePayload {
  return {
    nombre: form.nombre.trim(),
    estado: form.estado,
    valores: form.valores
      .map((value) => ({
        id: value.catalogValueId,
        valor: value.valor.trim(),
        colorHexadecimal: value.usaColor
          ? value.colorHexadecimal.trim().toUpperCase()
          : null,
        orden: Number(value.orden),
      }))
      .filter((value) => value.valor.length > 0),
  };
}
