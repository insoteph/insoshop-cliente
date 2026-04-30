"use client";

import { formatCurrency } from "@/modules/core/lib/formatters";
import { DetailModal } from "@/modules/core/components/DetailModal";
import { ProductImageGallery } from "@/modules/store-catalog/components/ProductImageGallery";
import {
  buildProductVariantSummary,
  getProductAttributeValues,
  getProductDetailImageUrls,
  isProductColorAttribute,
} from "@/modules/products/mappers/product-detail.mapper";
import type {
  Product,
  ProductAttribute,
  ProductDetail,
  ProductVariant,
} from "@/modules/products/services/product-service";

type ProductDetailModalProps = {
  open: boolean;
  product: Product | null;
  detail: ProductDetail | null;
  isLoading: boolean;
  error: string | null;
  currency: string;
  onClose: () => void;
  onRetry: () => void;
};

function StatusChip({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${
        active
          ? "bg-[#ECFDF5] text-[#059669]"
          : "bg-[#FEF2F2] text-[#DC2626]"
      }`}
    >
      {active ? "Activo" : "Inactivo"}
    </span>
  );
}

function ColorSwatch({ colorHexadecimal }: { colorHexadecimal: string }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-4 w-4 rounded-full border border-black/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)]"
      style={{ backgroundColor: colorHexadecimal }}
    />
  );
}

function getVariantImageUrl(variant: ProductVariant) {
  return (
    variant.imagenes.find((image) => image.trim())?.trim() ||
    variant.urlImagenPrincipal?.trim() ||
    null
  );
}

function AttributeValuePill({
  value,
}: {
  value: ProductAttribute["valores"][number];
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#dbe7ff] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] shadow-[0_8px_18px_rgba(15,23,42,0.05)]">
      {value.colorHexadecimal ? (
        <ColorSwatch colorHexadecimal={value.colorHexadecimal} />
      ) : null}
      {value.valor}
    </span>
  );
}

function ProductStatsCard({
  label,
  value,
  subvalue,
}: {
  label: string;
  value: string;
  subvalue?: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] p-4 shadow-[0_10px_22px_rgba(15,23,42,0.04)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-[var(--foreground-strong)]">
        {value}
      </p>
      {subvalue ? (
        <p className="mt-1 text-xs text-[var(--muted)]">{subvalue}</p>
      ) : null}
    </div>
  );
}

function ProductVariantCard({
  variant,
  currency,
}: {
  variant: ProductVariant;
  currency: string;
}) {
  const imageUrl = getVariantImageUrl(variant);
  const summary = buildProductVariantSummary(variant);

  return (
    <article className="overflow-hidden rounded-[24px] border border-[var(--line)] bg-[var(--panel)] shadow-[0_10px_22px_rgba(15,23,42,0.05)]">
      <div className="border-b border-[var(--line)] bg-[linear-gradient(135deg,rgba(37,99,235,0.08),rgba(29,78,216,0.03))] px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Variante #{variant.id}
            </p>
            <p className="mt-1 line-clamp-2 text-sm font-semibold text-[var(--foreground-strong)]">
              {summary}
            </p>
          </div>
          <StatusChip active={variant.estado} />
        </div>
      </div>

      <div className="grid gap-4 p-4 sm:grid-cols-[96px_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)]">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={summary}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-[96px] items-center justify-center text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              Sin imagen
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--background-soft)] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                Precio
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--foreground-strong)]">
                {formatCurrency(variant.precio, currency)}
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--line)] bg-[var(--background-soft)] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                Stock
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--foreground-strong)]">
                {variant.cantidad} unidades
              </p>
            </div>
          </div>

          {variant.valores.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {variant.valores.map((value) => (
                <span
                  key={`${variant.id}-${value.productoAtributoId}-${value.atributoCatalogoValorId}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--foreground)]"
                >
                  {value.colorHexadecimal ? (
                    <ColorSwatch colorHexadecimal={value.colorHexadecimal} />
                  ) : null}
                  {value.atributoCatalogoNombre}: {value.valor}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function ProductDetailModal({
  open,
  product,
  detail,
  isLoading,
  error,
  currency,
  onClose,
  onRetry,
}: ProductDetailModalProps) {
  const activeProduct = detail ?? product;

  if (!activeProduct) {
    return null;
  }

  const imageUrls = getProductDetailImageUrls(
    activeProduct.imagenes,
    detail?.variantes ?? [],
  );
  const attributes = detail?.atributos ?? [];
  const variants = detail?.variantes ?? [];
  const totalVariantStock = variants.reduce(
    (total, variant) => total + variant.cantidad,
    0,
  );

  return (
    <DetailModal
      open={open}
      title={activeProduct.nombre}
      subtitle={
        <div className="flex flex-wrap items-center gap-2">
          <span>{activeProduct.categoriaNombre}</span>
          <span className="text-[var(--line-strong)]">•</span>
          <span>{activeProduct.tiendaNombre}</span>
          <StatusChip active={activeProduct.estado} />
        </div>
      }
      size="xl"
      onClose={onClose}
    >
      <div className="space-y-5">
        {isLoading && !detail ? (
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-4 text-sm text-[var(--muted)]">
            Cargando detalle completo del producto...
          </div>
        ) : null}

        {error && !detail ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
            <p>{error}</p>
            <button
              type="button"
              className="mt-3 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-700"
              onClick={onRetry}
            >
              Reintentar detalle
            </button>
          </div>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div className="space-y-4">
            <ProductImageGallery
              key={activeProduct.id}
              productName={activeProduct.nombre}
              imageUrls={imageUrls}
            />
          </div>

          <div className="space-y-4 rounded-[28px] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(248,251,255,0.96),#ffffff)] p-5 shadow-[0_14px_32px_rgba(15,23,42,0.05)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Resumen ejecutivo
                </p>
                <h3 className="text-2xl font-semibold leading-tight text-[var(--foreground-strong)]">
                  {activeProduct.nombre}
                </h3>
              </div>

              <StatusChip active={activeProduct.estado} />
            </div>

            {activeProduct.descripcion.trim() ? (
              <div className="space-y-2 rounded-2xl border border-[var(--line)] bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Descripcion
                </p>
                <p className="text-sm leading-6 text-[var(--foreground)]">
                  {activeProduct.descripcion}
                </p>
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              <ProductStatsCard
                label="Precio desde"
                value={formatCurrency(activeProduct.precio, currency)}
                subvalue="Valor base del producto"
              />
              <ProductStatsCard
                label="Stock total"
                value={`${activeProduct.cantidad} unidades`}
                subvalue={
                  detail
                    ? `${totalVariantStock} unidades en variantes`
                    : "Datos ampliados pendientes"
                }
              />
              <ProductStatsCard
                label="Categoria"
                value={activeProduct.categoriaNombre}
              />
              <ProductStatsCard
                label="Tienda"
                value={activeProduct.tiendaNombre}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ProductStatsCard
            label="Imagenes"
            value={`${imageUrls.length} imagen${imageUrls.length === 1 ? "" : "es"}`}
          />
          <ProductStatsCard
            label="Atributos"
            value={`${attributes.length} atributo${attributes.length === 1 ? "" : "s"}`}
          />
          <ProductStatsCard
            label="Variantes"
            value={`${variants.length} variante${variants.length === 1 ? "" : "s"}`}
          />
          <ProductStatsCard
            label="Disponibilidad"
            value={activeProduct.estado ? "Publicado" : "Oculto"}
          />
        </div>

        {attributes.length > 0 ? (
          <section className="space-y-3 rounded-[28px] border border-[var(--line)] bg-[var(--panel)] p-5 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Atributos
                </p>
                <h4 className="mt-1 text-base font-semibold text-[var(--foreground-strong)]">
                  Configuracion del producto
                </h4>
              </div>
              <span className="text-xs text-[var(--muted)]">
                {attributes.length} bloque{attributes.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              {attributes.map((attribute) => {
                const values = getProductAttributeValues(attribute);
                const colorMode = isProductColorAttribute(attribute);

                return (
                  <article
                    key={attribute.id}
                    className="space-y-3 rounded-[22px] border border-[var(--line)] bg-[var(--background-soft)] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--foreground-strong)]">
                          {attribute.atributoCatalogoNombre}
                        </p>
                        <p className="text-xs text-[var(--muted)]">
                          {values.length} valor{values.length === 1 ? "" : "es"}
                        </p>
                      </div>
                      {colorMode ? (
                        <span className="rounded-full bg-[#EEF4FF] px-2.5 py-1 text-[11px] font-semibold text-[#2563EB]">
                          Color
                        </span>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {values.map((value) => (
                        <AttributeValuePill key={value.id} value={value} />
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}

        {variants.length > 0 ? (
          <section className="space-y-3 rounded-[28px] border border-[var(--line)] bg-[var(--panel)] p-5 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Variantes
                </p>
                <h4 className="mt-1 text-base font-semibold text-[var(--foreground-strong)]">
                  Combinaciones disponibles
                </h4>
              </div>
              <span className="text-xs text-[var(--muted)]">
                {variants.length} fila{variants.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              {variants.map((variant) => (
                <ProductVariantCard
                  key={variant.id}
                  variant={variant}
                  currency={currency}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </DetailModal>
  );
}
