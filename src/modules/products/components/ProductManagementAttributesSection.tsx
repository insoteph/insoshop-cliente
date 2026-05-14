"use client";

import type { Dispatch, FormEvent, RefObject, SetStateAction } from "react";

import { AppButton } from "@/modules/core/components/AppButton";
import { PanelSectionHeader } from "@/modules/core/components/PanelSectionHeader";
import { ColorSwatch } from "@/modules/products/components/shared/ProductVisuals";
import type {
  CatalogAttribute,
  CatalogAttributeDetail,
} from "@/modules/attribute-catalog/services/attribute-catalog-service";
import type { ProductAttribute, ProductDetail } from "@/modules/products/services/product-service";

type ProductAttributeFormState = {
  atributoCatalogoId: number;
  atributoCatalogoValorIds: number[];
};

type ProductManagementAttributesSectionProps = {
  product: ProductDetail;
  canManage: boolean;
  attributeForm: ProductAttributeFormState;
  attributeFormError: string | null;
  editingAttributeId: number | null;
  isAttributeEditorOpen: boolean;
  isSavingAttribute: boolean;
  activeCatalogDetail: CatalogAttributeDetail | undefined;
  availableCatalogAttributes: CatalogAttribute[];
  attributeEditorRef: RefObject<HTMLDivElement | null>;
  setAttributeForm: Dispatch<SetStateAction<ProductAttributeFormState>>;
  resetAttributeForm: () => void;
  openAttributeEditor: () => void;
  closeAttributeEditor: () => void;
  handleCatalogAttributeChange: (attributeId: number) => Promise<void>;
  handleEditAttribute: (attribute: ProductAttribute) => Promise<void>;
  handleDeleteAttribute: (attribute: ProductAttribute) => Promise<void>;
  handleSaveAttribute: (event: FormEvent<HTMLFormElement>) => void;
};

export function ProductManagementAttributesSection({
  product,
  canManage,
  attributeForm,
  attributeFormError,
  editingAttributeId,
  isAttributeEditorOpen,
  isSavingAttribute,
  activeCatalogDetail,
  availableCatalogAttributes,
  attributeEditorRef,
  setAttributeForm,
  resetAttributeForm,
  openAttributeEditor,
  closeAttributeEditor,
  handleCatalogAttributeChange,
  handleEditAttribute,
  handleDeleteAttribute,
  handleSaveAttribute,
}: ProductManagementAttributesSectionProps) {
  return (
    <section className="space-y-4 rounded-none border-0 bg-transparent p-0 sm:rounded-[24px] sm:border sm:border-[var(--line)] sm:bg-[var(--panel-strong)] sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PanelSectionHeader
          title="Opciones del producto"
          subtitle="Elige las opciones y valores que verá tu cliente en este producto, por ejemplo color, talla o material."
          headingLevel="h4"
        />
        {canManage ? (
          <AppButton
            variant="secondary"
            iconPath="/icons/plus-circle.svg"
            className="w-full sm:w-auto"
            onClick={() => {
              resetAttributeForm();
              openAttributeEditor();
            }}
          >
            Agregar opción
          </AppButton>
        ) : null}
      </div>

      <div className="divide-y divide-[var(--line)]/60">
        {product.atributos.length > 0 ? (
          product.atributos.map((attribute) => (
            <article
              key={attribute.id}
              className="py-3 first:pt-0 last:pb-0 sm:rounded-2xl sm:border sm:border-[var(--line)] sm:bg-[var(--panel)] sm:px-4 sm:py-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[var(--foreground-strong)]">
                    {attribute.atributoCatalogoNombre}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {attribute.valores.map((value) => (
                      <span
                        key={value.id}
                        className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]"
                      >
                        {value.colorHexadecimal ? (
                          <ColorSwatch colorHexadecimal={value.colorHexadecimal} />
                        ) : null}
                        {value.valor}
                      </span>
                    ))}
                  </div>
                </div>

                {canManage ? (
                  <div className="flex flex-wrap gap-2">
                    <AppButton
                      variant="secondary"
                      iconPath="/icons/edit.svg"
                      onClick={() => void handleEditAttribute(attribute)}
                    >
                      Editar
                    </AppButton>
                    <AppButton
                      variant="danger"
                      iconPath="/icons/trash.svg"
                      onClick={() => void handleDeleteAttribute(attribute)}
                    >
                      Quitar
                    </AppButton>
                  </div>
                ) : null}
              </div>
            </article>
          ))
        ) : (
          <div className="border-0 bg-transparent px-0 py-3 text-sm text-[var(--muted)] sm:rounded-2xl sm:border sm:border-dashed sm:border-[var(--line)] sm:bg-[var(--panel)] sm:px-4 sm:py-6">
            Este producto todavía no tiene opciones configuradas. Agrega color,
            talla u otras opciones antes de crear combinaciones de venta.
          </div>
        )}
      </div>

      {canManage ? (
        isAttributeEditorOpen ? (
          <div
            ref={attributeEditorRef}
            className="rounded-none border-0 bg-transparent p-0 sm:rounded-2xl sm:border sm:border-[var(--line)] sm:bg-[var(--panel)] sm:p-4"
          >
            <form className="space-y-4" onSubmit={handleSaveAttribute}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <PanelSectionHeader
                  title={editingAttributeId ? "Editar opción" : "Nueva opción"}
                  subtitle="Selecciona la opción general y luego marca los valores que estarán disponibles en este producto."
                  headingLevel="h4"
                />
                <AppButton
                  variant="cancel"
                  iconPath="/icons/cross.svg"
                  onClick={closeAttributeEditor}
                >
                  Cerrar
                </AppButton>
              </div>

              <select
                value={attributeForm.atributoCatalogoId || ""}
                onChange={(event) =>
                  void handleCatalogAttributeChange(Number(event.target.value))
                }
                className="app-input w-full rounded-2xl px-4 py-3 text-sm"
              >
                <option value="">Selecciona una opción</option>
                {availableCatalogAttributes.map((attribute) => (
                  <option key={attribute.id} value={attribute.id}>
                    {attribute.nombre}
                  </option>
                ))}
              </select>

              {activeCatalogDetail ? (
                <div className="rounded-none border-0 bg-transparent p-0 sm:rounded-2xl sm:border sm:border-[var(--line)] sm:bg-[var(--panel-muted)] sm:p-4">
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    Valores disponibles para este producto
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {activeCatalogDetail.valores.map((value) => {
                      const isSelected =
                        attributeForm.atributoCatalogoValorIds.includes(value.id);

                      return (
                        <button
                          key={value.id}
                          type="button"
                          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                            isSelected
                              ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                              : "border-[var(--line)] bg-[var(--panel)] text-[var(--foreground)]"
                          }`}
                          onClick={() =>
                            setAttributeForm((current) => ({
                              ...current,
                              atributoCatalogoValorIds: isSelected
                                ? current.atributoCatalogoValorIds.filter(
                                    (valueId) => valueId !== value.id,
                                  )
                                : [...current.atributoCatalogoValorIds, value.id],
                            }))
                          }
                        >
                          <span className="inline-flex items-center gap-2">
                            {value.colorHexadecimal ? (
                              <ColorSwatch colorHexadecimal={value.colorHexadecimal} />
                            ) : null}
                            {value.valor}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {attributeFormError ? (
                <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
                  {attributeFormError}
                </p>
              ) : null}

              <div className="flex flex-wrap justify-end gap-2">
                <AppButton
                  variant="secondary"
                  iconPath="/icons/refresh.svg"
                  className="w-full sm:w-auto"
                  onClick={resetAttributeForm}
                >
                  Limpiar
                </AppButton>
                <AppButton
                  iconPath="/icons/save.svg"
                  type="submit"
                  disabled={isSavingAttribute}
                >
                  {isSavingAttribute ? "Guardando..." : "Guardar opción"}
                </AppButton>
              </div>
            </form>
          </div>
        ) : (
          <div className="border-0 bg-transparent px-0 py-3 text-sm text-[var(--muted)] sm:rounded-2xl sm:border sm:border-dashed sm:border-[var(--line)] sm:bg-[var(--panel)] sm:px-4 sm:py-5">
            Usa{" "}
            <span className="font-semibold text-[var(--foreground)]">
              Agregar opción
            </span>{" "}
            para asociar al producto opciones como color, talla o material con
            los valores que aplican.
          </div>
        )
      ) : null}
    </section>
  );
}
