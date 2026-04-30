"use client";

import type {
  Dispatch,
  FormEvent,
  RefObject,
  SetStateAction,
} from "react";

import { MaterialInput } from "@/modules/core/components/MaterialInput";
import { formatCurrency } from "@/modules/core/lib/formatters";
import { formatVariantValues } from "@/modules/products/mappers/product-form.mapper";
import {
  ColorSwatch,
  NoImageThumbnail,
} from "@/modules/products/components/shared/ProductVisuals";
import type { ProductDetail, ProductVariant } from "@/modules/products/services/product-service";

type ProductVariantFormState = {
  precio: string;
  cantidad: string;
  estado: boolean;
  urlImagen: string;
  seleccionPorAtributo: Record<number, number>;
};

type ProductManagementVariantsSectionProps = {
  product: ProductDetail;
  currency: string;
  canManage: boolean;
  variantForm: ProductVariantFormState;
  variantFormError: string | null;
  editingVariantId: number | null;
  isVariantEditorOpen: boolean;
  isSavingVariant: boolean;
  isUploadingVariantImage: boolean;
  variantImageInputRef: RefObject<HTMLInputElement | null>;
  variantEditorRef: RefObject<HTMLDivElement | null>;
  setVariantForm: Dispatch<SetStateAction<ProductVariantFormState>>;
  resetVariantForm: () => void;
  openVariantEditor: () => void;
  closeVariantEditor: () => void;
  handleEditVariant: (variant: ProductVariant) => void;
  handleVariantSelectionChange: (
    productAttributeId: number,
    productAttributeValueId: number,
  ) => void;
  handleVariantImageUpload: (file: File | null) => Promise<void>;
  handleSaveVariant: (event: FormEvent<HTMLFormElement>) => void;
  handleToggleVariant: (variant: ProductVariant) => Promise<void>;
};

export function ProductManagementVariantsSection({
  product,
  currency,
  canManage,
  variantForm,
  variantFormError,
  editingVariantId,
  isVariantEditorOpen,
  isSavingVariant,
  isUploadingVariantImage,
  variantImageInputRef,
  variantEditorRef,
  setVariantForm,
  resetVariantForm,
  openVariantEditor,
  closeVariantEditor,
  handleEditVariant,
  handleVariantSelectionChange,
  handleVariantImageUpload,
  handleSaveVariant,
  handleToggleVariant,
}: ProductManagementVariantsSectionProps) {
  return (
    <section className="space-y-4 rounded-none border-0 bg-transparent p-0 sm:rounded-[24px] sm:border sm:border-[var(--line)] sm:bg-[var(--panel-strong)] sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-base font-semibold text-[var(--foreground-strong)]">
            Combinaciones de venta
          </h4>
          <p className="text-sm text-[var(--muted)]">
            Cada combinación representa una presentación real que puedes
            vender: precio, existencias e imagen principal.
          </p>
        </div>
      </div>

      <div className="divide-y divide-[var(--line)]/60">
        {product.variantes.length > 0 ? (
          product.variantes.map((variant) => (
            <article
              key={variant.id}
              className="py-3 first:pt-0 last:pb-0 sm:rounded-2xl sm:border sm:border-[var(--line)] sm:bg-[var(--panel)] sm:p-4"
            >
              <div className="grid gap-4 md:grid-cols-[88px_minmax(0,1fr)_auto] md:items-center">
                <div className="h-20 w-20 overflow-hidden rounded-none border-0 bg-transparent sm:rounded-2xl sm:border sm:border-[var(--line)] sm:bg-[var(--panel-muted)]">
                  {variant.urlImagenPrincipal ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={variant.urlImagenPrincipal}
                      alt={formatVariantValues(variant) || `Combinación ${variant.id}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <NoImageThumbnail
                      size={80}
                      className="flex items-center justify-center overflow-hidden rounded-none border-0 bg-transparent sm:rounded-2xl sm:border sm:border-[var(--line)] sm:bg-[var(--panel-muted)]"
                      iconClassName="h-8 w-8"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {variant.valores.map((value) => (
                      <span
                        key={`${variant.id}-${value.productoAtributoId}-${value.atributoCatalogoValorId}`}
                        className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--panel-muted)] px-3 py-1 text-xs font-semibold text-[var(--foreground)]"
                      >
                        {value.colorHexadecimal ? (
                          <ColorSwatch colorHexadecimal={value.colorHexadecimal} />
                        ) : null}
                        {value.atributoCatalogoNombre}: {value.valor}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="font-semibold text-[var(--foreground-strong)]">
                      {formatCurrency(variant.precio, currency)}
                    </span>
                    <span className="text-[var(--muted)]">
                      Stock: {variant.cantidad}
                    </span>
                    <span
                      className={
                        variant.estado
                          ? "text-[var(--success)]"
                          : "text-[var(--danger)]"
                      }
                    >
                      {variant.estado ? "Activa" : "Inactiva"}
                    </span>
                  </div>
                </div>

                {canManage ? (
                  <div className="flex flex-wrap gap-2 md:justify-end">
                    <button
                      type="button"
                      className="app-button-secondary inline-flex h-9 items-center rounded-xl px-3 text-xs font-semibold"
                      onClick={() => handleEditVariant(variant)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className={`inline-flex h-9 items-center rounded-xl px-3 text-xs font-semibold ${
                        variant.estado ? "app-button-danger" : "app-button-primary"
                      }`}
                      onClick={() => void handleToggleVariant(variant)}
                    >
                      {variant.estado ? "Inactivar" : "Activar"}
                    </button>
                  </div>
                ) : null}
              </div>
            </article>
          ))
        ) : (
          <div className="border-0 bg-transparent px-0 py-3 text-sm text-[var(--muted)] sm:rounded-2xl sm:border sm:border-dashed sm:border-[var(--line)] sm:bg-[var(--panel)] sm:px-4 sm:py-6">
            Aún no existen combinaciones de venta para este producto.
          </div>
        )}
      </div>

      {canManage ? (
        isVariantEditorOpen ? (
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
                {product.atributos.length > 0 ? (
                  <span>
                    Opciones disponibles en este producto:{" "}
                    <span className="font-semibold text-[var(--foreground)]">
                      {product.atributos
                        .map((attribute) => attribute.atributoCatalogoNombre)
                        .join(", ")}
                    </span>
                  </span>
                ) : (
                  <span>
                    Primero agrega al menos una opción del producto para poder
                    crear combinaciones de venta.
                  </span>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <MaterialInput
                  id={`variant-price-${product.id}`}
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
                  id={`variant-stock-${product.id}`}
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
                {product.atributos.map((attribute) => (
                  <select
                    key={attribute.id}
                    value={variantForm.seleccionPorAtributo[attribute.id] || ""}
                    onChange={(event) =>
                      handleVariantSelectionChange(
                        attribute.id,
                        Number(event.target.value),
                      )
                    }
                    className="app-input w-full rounded-2xl px-4 py-3 text-sm"
                  >
                    <option value="">
                      Selecciona {attribute.atributoCatalogoNombre}
                    </option>
                    {attribute.valores.map((value) => (
                      <option key={value.id} value={value.id}>
                        {value.valor}
                      </option>
                    ))}
                  </select>
                ))}
              </div>

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_180px]">
                <div className="rounded-none border-0 bg-transparent p-0 sm:rounded-2xl sm:border sm:border-dashed sm:border-[var(--line)] sm:bg-[var(--panel-muted)] sm:p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--foreground)]">
                        Imagen principal de esta combinación
                      </p>
                      <p className="text-sm text-[var(--muted)]">
                        Usa una imagen que represente visualmente esta
                        combinación.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="app-button-primary inline-flex h-10 items-center rounded-xl px-3.5 text-sm font-semibold disabled:opacity-60"
                      onClick={() => variantImageInputRef.current?.click()}
                      disabled={isUploadingVariantImage}
                    >
                      {isUploadingVariantImage ? "Subiendo..." : "Subir imagen"}
                    </button>
                  </div>
                  <input
                    ref={variantImageInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="sr-only"
                    onChange={(event) =>
                      void handleVariantImageUpload(
                        event.target.files?.[0] ?? null,
                      )
                    }
                  />
                </div>

                <div className="rounded-none border-0 bg-transparent p-0 sm:rounded-2xl sm:border sm:border-[var(--line)] sm:bg-[var(--panel-muted)] sm:p-3">
                  <div className="h-32 overflow-hidden rounded-none border-0 bg-transparent sm:rounded-2xl sm:border sm:border-[var(--line)] sm:bg-[var(--panel)]">
                    {variantForm.urlImagen.trim() ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={variantForm.urlImagen.trim()}
                        alt="Vista previa de combinación"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <NoImageThumbnail
                          size={72}
                          className="flex items-center justify-center overflow-hidden rounded-none border-0 bg-transparent sm:rounded-2xl sm:border sm:border-[var(--line)] sm:bg-[var(--panel-muted)]"
                        />
                      </div>
                    )}
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
                  disabled={isSavingVariant || product.atributos.length === 0}
                  className="app-button-primary inline-flex h-10 items-center rounded-xl px-4 text-sm font-semibold disabled:opacity-60"
                >
                  {isSavingVariant ? "Guardando..." : "Guardar combinación"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="border-0 bg-transparent px-0 py-3 text-sm text-[var(--muted)] sm:rounded-2xl sm:border sm:border-dashed sm:border-[var(--line)] sm:bg-[var(--panel)] sm:px-4 sm:py-5">
            Usa{" "}
            <span className="font-semibold text-[var(--foreground)]">
              Agregar combinación
            </span>{" "}
            para definir cada presentación real de venta con su precio,
            existencias e imagen.
          </div>
        )
      ) : null}

      {canManage ? (
        <div className="flex justify-end pt-1">
          <button
            type="button"
            className="app-button-secondary inline-flex h-10 w-full items-center justify-center rounded-xl px-3.5 text-sm font-semibold sm:w-auto"
            onClick={() => {
              resetVariantForm();
              openVariantEditor();
            }}
            disabled={product.atributos.length === 0}
          >
            Agregar combinación
          </button>
        </div>
      ) : null}
    </section>
  );
}
