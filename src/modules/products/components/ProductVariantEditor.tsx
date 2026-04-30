"use client";

import type { Dispatch, FormEvent, RefObject, SetStateAction } from "react";

import { MaterialInput } from "@/modules/core/components/MaterialInput";
import { ProductVariantsImagePicker } from "@/modules/products/components/ProductVariantsImagePicker";
import type { ProductAttributeDraft } from "@/modules/products/components/ProductAttributesPanel";

type ProductVariantEditorState = {
  precio: string;
  cantidad: string;
  estado: boolean;
  urlImagen: string | null;
  valoresPorAtributo: Record<number, string>;
};

type ProductVariantEditorProps = {
  productId: number;
  attributes: ProductAttributeDraft[];
  variantForm: ProductVariantEditorState;
  variantFormError: string | null;
  editingVariantId: number | null;
  isVariantEditorOpen: boolean;
  isSavingVariant: boolean;
  isUploadingVariantImage: boolean;
  variantEditorRef: RefObject<HTMLDivElement | null>;
  setVariantForm: Dispatch<SetStateAction<ProductVariantEditorState>>;
  resetVariantForm: () => void;
  closeVariantEditor: () => void;
  handleVariantSelectionChange: (productAttributeId: number, productAttributeValueId: number) => void;
  handleSaveVariant: (event: FormEvent<HTMLFormElement>) => void;
};

export function ProductVariantEditor({
  productId,
  attributes,
  variantForm,
  variantFormError,
  editingVariantId,
  isVariantEditorOpen,
  isSavingVariant,
  isUploadingVariantImage,
  variantEditorRef,
  setVariantForm,
  resetVariantForm,
  closeVariantEditor,
  handleVariantSelectionChange,
  handleSaveVariant,
}: ProductVariantEditorProps) {
  if (!isVariantEditorOpen) {
    return (
      <div className="border-0 bg-transparent px-0 py-3 text-sm text-[var(--muted)] sm:rounded-2xl sm:border sm:border-dashed sm:border-[var(--line)] sm:bg-[var(--panel)] sm:px-4 sm:py-5">
        Usa{" "}
        <span className="font-semibold text-[var(--foreground)]">
          Agregar combinación
        </span>{" "}
        para definir cada presentación real de venta con su precio, existencias
        e imagen.
      </div>
    );
  }

  return (
    <div
      ref={variantEditorRef}
      className="rounded-none border-0 bg-transparent p-0 sm:rounded-2xl sm:border sm:border-[var(--line)] sm:bg-[var(--panel)] sm:p-4"
    >
      <form className="space-y-4" onSubmit={handleSaveVariant}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h5 className="text-sm font-semibold text-[var(--foreground-strong)]">
              {editingVariantId ? "Editar combinación" : "Nueva combinación"}
            </h5>
            <p className="text-sm text-[var(--muted)]">
              Selecciona un valor por cada opción y define el precio, las
              existencias y la imagen de esta combinación.
            </p>
          </div>
          <button
            type="button"
            className="app-button-secondary inline-flex h-10 w-full items-center justify-center rounded-xl px-3.5 text-sm font-semibold sm:w-auto"
            onClick={closeVariantEditor}
          >
            Cerrar
          </button>
        </div>

        <div className="rounded-none border-0 bg-transparent px-0 py-2 text-sm text-[var(--muted)] sm:rounded-2xl sm:border sm:border-[var(--line)] sm:bg-[var(--panel-muted)] sm:px-4 sm:py-3">
          {attributes.length > 0 ? (
            <span>
              Opciones disponibles en este producto:{" "}
              <span className="font-semibold text-[var(--foreground)]">
                {attributes.map((attribute) => attribute.atributoCatalogoId).join(", ")}
              </span>
            </span>
          ) : (
            <span>
              Primero agrega al menos una opción del producto para poder crear
              combinaciones de venta.
            </span>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <MaterialInput
            id={`variant-price-${productId}`}
            label="Precio"
            type="number"
            min="0.01"
            step="0.01"
            value={variantForm.precio}
            onChange={(event) =>
              setVariantForm((current) => ({
                ...current,
                precio: event.target.value,
              }))
            }
            required
          />
          <MaterialInput
            id={`variant-stock-${productId}`}
            label="Existencias"
            type="number"
            min="0"
            value={variantForm.cantidad}
            onChange={(event) =>
              setVariantForm((current) => ({
                ...current,
                cantidad: event.target.value,
              }))
            }
            required
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {attributes.map((attribute) => (
            <select
              key={attribute.key}
              value={variantForm.valoresPorAtributo[attribute.atributoCatalogoId] || ""}
              onChange={(event) =>
                handleVariantSelectionChange(
                  attribute.atributoCatalogoId,
                  Number(event.target.value),
                )
              }
              className="app-input w-full rounded-2xl px-4 py-3 text-sm"
            >
              <option value="">Selecciona un valor</option>
              {attribute.atributoCatalogoValorIds.map((valueId) => (
                <option key={valueId} value={valueId}>
                  {valueId}
                </option>
              ))}
            </select>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_180px]">
          <div className="rounded-none border-0 bg-transparent p-0 sm:rounded-2xl sm:border sm:border-dashed sm:border-[var(--line)] sm:bg-[var(--panel-muted)] sm:p-4">
            <p className="text-sm font-semibold text-[var(--foreground)]">
              Imagen principal de esta combinación
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Usa una imagen que represente visualmente esta combinación.
            </p>
          </div>

          <div className="rounded-none border-0 bg-transparent p-0 sm:rounded-2xl sm:border sm:border-[var(--line)] sm:bg-[var(--panel-muted)] sm:p-3">
            <div className="h-32 overflow-hidden rounded-none border-0 bg-transparent sm:rounded-2xl sm:border sm:border-[var(--line)] sm:bg-[var(--panel)]">
              <ProductVariantsImagePicker
                value={variantForm.urlImagen}
                onChange={(nextImage) =>
                  setVariantForm((current) => ({
                    ...current,
                    urlImagen: nextImage,
                  }))
                }
                disabled={isUploadingVariantImage}
                className="h-full"
              />
            </div>
          </div>
        </div>

        <label className="flex items-center gap-3 rounded-none border-0 bg-transparent px-0 py-2 text-sm text-[var(--foreground)] sm:rounded-2xl sm:border sm:border-[var(--line)] sm:bg-[var(--panel-muted)] sm:px-4 sm:py-3">
          <input
            type="checkbox"
            checked={variantForm.estado}
            onChange={(event) =>
              setVariantForm((current) => ({
                ...current,
                estado: event.target.checked,
              }))
            }
          />
          Combinación activa
        </label>

        {variantFormError ? (
          <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
            {variantFormError}
          </p>
        ) : null}

        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className="app-button-secondary inline-flex h-10 items-center rounded-xl px-3.5 text-sm font-semibold"
            onClick={resetVariantForm}
          >
            Limpiar
          </button>
          <button
            type="submit"
            disabled={isSavingVariant}
            className="app-button-primary inline-flex h-10 items-center rounded-xl px-4 text-sm font-semibold disabled:opacity-60"
          >
            {isSavingVariant ? "Guardando..." : "Guardar combinación"}
          </button>
        </div>
      </form>
    </div>
  );
}
