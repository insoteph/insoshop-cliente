"use client";

import type { ProductAttributeDraft } from "@/modules/products/components/ProductAttributesPanel";
import type { ProductVariantDraft } from "@/modules/products/services/product-service";

export type ProductFormMode = "create" | "edit";

export type ProductFormState = {
  nombre: string;
  descripcion: string;
  categoriaId: number;
  estado: boolean;
  atributos: ProductAttributeDraft[];
  variantes: ProductVariantDraft[];
};

export const INITIAL_PRODUCT_FORM: ProductFormState = {
  nombre: "",
  descripcion: "",
  categoriaId: 0,
  estado: true,
  atributos: [],
  variantes: [],
};
