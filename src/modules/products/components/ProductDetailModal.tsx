"use client";

import { formatCurrency } from "@/modules/core/lib/formatters";
import { DetailModal } from "@/modules/core/components/DetailModal";
import { ProductImageGallery } from "@/modules/store-catalog/components/ProductImageGallery";
import { ColorSwatch } from "@/modules/products/components/shared/ProductVisuals";
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
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${
        active
          ? "border-[color:color-mix(in_srgb,var(--success)_28%,transparent)] bg-[color:color-mix(in_srgb,var(--success-soft)_80%,var(--panel-strong)_20%)] text-[color:color-mix(in_srgb,var(--success)_84%,var(--foreground)_16%)]"
          : "border-[color:color-mix(in_srgb,var(--danger)_28%,transparent)] bg-[color:color-mix(in_srgb,var(--danger-soft)_80%,var(--panel-strong)_20%)] text-[color:color-mix(in_srgb,var(--danger)_84%,var(--foreground)_16%)]"
      }`}
    >
      {active ? "Activo" : "Inactivo"}
    </span>
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
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--panel-strong)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] shadow-[0_8px_18px_rgba(15,23,42,0.05)]">
      {value.colorHexadecimal ? (
        <ColorSwatch
          colorHexadecimal={value.colorHexadecimal}
          className="h-4 w-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]"
        />
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

function ProductVariantRow({
  variant,
  currency,
}: {
  variant: ProductVariant;
  currency: string;
}) {
  const imageUrl = getVariantImageUrl(variant);
  const summary = buildProductVariantSummary(variant);

  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
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

      <div className="mt-3 grid gap-3 sm:grid-cols-[88px_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel-muted)]">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={summary}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-[88px] items-center justify-center px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              Sin imagen
            </div>
          )}
        </div>

        <div className="space-y-2.5">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full border border-[var(--line)] px-2.5 py-1 text-[11px] font-semibold text-[var(--foreground-strong)]">
              Precio: {formatCurrency(variant.precio, currency)}
            </span>
            <span className="inline-flex items-center rounded-full border border-[var(--line)] px-2.5 py-1 text-[11px] font-semibold text-[var(--foreground-strong)]">
              Stock: {variant.cantidad}
            </span>
          </div>

          {variant.valores.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {variant.valores.map((value) => (
                <span
                  key={`${variant.id}-${value.productoAtributoId}-${value.atributoCatalogoValorId}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] px-2.5 py-1 text-[11px] font-semibold text-[var(--foreground)]"
                >
                  {value.colorHexadecimal ? (
                    <ColorSwatch
                      colorHexadecimal={value.colorHexadecimal}
                      className="h-3.5 w-3.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]"
                    />
                  ) : null}
                  {value.atributoCatalogoNombre}: {value.valor}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
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
          <div className="rounded-2xl border border-[color:color-mix(in_srgb,var(--danger)_28%,transparent)] bg-[color:color-mix(in_srgb,var(--danger-soft)_78%,var(--panel-strong)_22%)] px-4 py-4 text-sm text-[color:color-mix(in_srgb,var(--danger)_84%,var(--foreground)_16%)]">
            <p>{error}</p>
            <button
              type="button"
              className="mt-3 rounded-xl border border-[color:color-mix(in_srgb,var(--danger)_28%,transparent)] px-3 py-2 text-sm font-medium text-[color:color-mix(in_srgb,var(--danger)_84%,var(--foreground)_16%)]"
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

          <div className="space-y-4 rounded-[28px] border border-[var(--line)] bg-[var(--panel-strong)] p-5 shadow-[0_14px_32px_rgba(15,23,42,0.05)]">
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
              <div className="space-y-2 rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] p-4">
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
          <section className="space-y-3 rounded-[28px] border border-[var(--line)] bg-[var(--panel)] px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] sm:px-5 sm:py-5">
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

            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {attributes.map((attribute) => {
                const values = getProductAttributeValues(attribute);
                const colorMode = isProductColorAttribute(attribute);

                return (
                  <article
                    key={attribute.id}
                    className="space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-3 py-3 sm:px-4"
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
                        <span className="rounded-full border border-[color:color-mix(in_srgb,var(--accent)_28%,transparent)] bg-[var(--accent-soft)] px-2.5 py-1 text-[11px] font-semibold text-[var(--accent)]">
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
          <section className="rounded-[28px] border border-[var(--line)] bg-[var(--panel)] px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] sm:px-5 sm:py-5">
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

            <div className="mt-4 border-t border-[var(--line)] pt-3 divide-y divide-[var(--line)]/70">
              {variants.map((variant) => (
                <ProductVariantRow
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
