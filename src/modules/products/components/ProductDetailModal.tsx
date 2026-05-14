"use client";

import { createPortal } from "react-dom";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { formatCurrency } from "@/modules/core/lib/formatters";
import { ImagePlaceholder } from "@/modules/core/components/ImagePlaceholder";
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

type SectionId = "resumen" | "imagenes" | "atributos" | "variantes";

const CLOSE_MS = 240;

function StatusChip({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${
        active
          ? "border-[color:color-mix(in_srgb,var(--success)_24%,var(--line))] bg-[var(--success-soft)] text-[var(--success)]"
          : "border-[color:color-mix(in_srgb,var(--danger)_24%,var(--line))] bg-[var(--danger-soft)] text-[var(--danger)]"
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-2 w-2 rounded-full ${
          active ? "bg-[var(--success)]" : "bg-[var(--danger)]"
        }`}
      />
      {active ? "Activo" : "Inactivo"}
    </span>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex h-4 w-4 items-center justify-center transition-transform duration-200 ${
        open ? "rotate-180" : ""
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-4 w-4"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </span>
  );
}

function SectionCard({
  id,
  title,
  subtitle,
  open,
  onToggle,
  leadingIcon,
  children,
}: {
  id: SectionId;
  title: string;
  subtitle: string;
  open: boolean;
  onToggle: (section: SectionId) => void;
  leadingIcon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--background)]">
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-[color:color-mix(in_srgb,var(--foreground)_3%,transparent)]"
      >
        <div className="min-w-0 flex items-center gap-3">
          {leadingIcon ? (
            <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
              {leadingIcon}
            </div>
          ) : null}

          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.08em] text-[var(--muted)]">
              {title}
            </p>
            <p className="mt-0.5 text-[13px] text-[var(--muted)]">{subtitle}</p>
          </div>
        </div>
        <ChevronIcon open={open} />
      </button>

      <div
        className={`grid transition-all duration-300 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden px-4 py-3">
          {children}
        </div>
      </div>
    </section>
  );
}

function ProductMetric({
  label,
  value,
  subvalue,
  leadingIcon,
}: {
  label: string;
  value: string;
  subvalue?: string;
  leadingIcon?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--background)] px-3 py-2.5">
      <div className="flex items-start gap-2.5">
        {leadingIcon ? (
          <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
            {leadingIcon}
          </div>
        ) : null}

        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.08em] text-[var(--muted)]">
            {label}
          </p>
          <p className="mt-0.5 text-sm font-semibold text-[var(--foreground-strong)]">
            {value}
          </p>
        </div>
      </div>
      {subvalue ? (
        <p className="mt-0.5 text-xs text-[var(--muted)]">{subvalue}</p>
      ) : null}
    </div>
  );
}

function AttributeValuePill({
  value,
}: {
  value: ProductAttribute["valores"][number];
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-2.5 py-1 text-xs font-semibold text-[var(--foreground)]">
      {value.colorHexadecimal ? (
        <ColorSwatch
          colorHexadecimal={value.colorHexadecimal}
          className="h-3.5 w-3.5"
        />
      ) : null}
      {value.valor}
    </span>
  );
}

function ProductVariantRow({
  variant,
  currency,
}: {
  variant: ProductVariant;
  currency: string;
}) {
  const imageUrl = variant.imagenes.find((image) => image.trim())?.trim() || variant.urlImagenPrincipal?.trim() || null;
  const summary = buildProductVariantSummary(variant);

  return (
    <article className="rounded-xl border border-[var(--line)] bg-[var(--background)] p-2.5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Variante #{variant.id}
          </p>
          <p className="mt-1 line-clamp-2 text-sm font-semibold text-[var(--foreground-strong)]">
            {summary}
          </p>
        </div>
        <StatusChip active={variant.estado} />
      </div>

      <div className="mt-2.5 grid gap-2.5 sm:grid-cols-[72px_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel-muted)]">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={summary}
              className="h-[72px] w-full object-cover"
            />
          ) : (
            <div className="flex h-[72px] items-center justify-center">
              <ImagePlaceholder
                size={48}
                iconPath="/icons/no-image.svg"
                iconClassName="h-5 w-5"
              />
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex flex-wrap gap-1.5">
            <span className="inline-flex items-center rounded-lg border border-[var(--line)] bg-[var(--background)] px-2 py-0.5 text-[11px] font-semibold text-[var(--foreground-strong)]">
              Precio: {formatCurrency(variant.precio, currency)}
            </span>
            <span className="inline-flex items-center rounded-lg border border-[var(--line)] bg-[var(--background)] px-2 py-0.5 text-[11px] font-semibold text-[var(--foreground-strong)]">
              Stock: {variant.cantidad}
            </span>
          </div>

          {variant.valores.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {variant.valores.map((value) => (
                <span
                  key={`${variant.id}-${value.productoAtributoId}-${value.atributoCatalogoValorId}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-[var(--line)] px-2 py-0.5 text-[11px] font-semibold text-[var(--foreground)]"
                >
                  {value.colorHexadecimal ? (
                    <ColorSwatch
                      colorHexadecimal={value.colorHexadecimal}
                      className="h-3.5 w-3.5"
                    />
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

function DetailSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--muted)]">
      Cargando detalle completo del producto...
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
  const [isMounted, setIsMounted] = useState(open);
  const [isVisible, setIsVisible] = useState(open);
  const [isPortalReady, setIsPortalReady] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<SectionId, boolean>>({
    resumen: false,
    imagenes: false,
    atributos: false,
    variantes: false,
  });

  useEffect(() => {
    setIsPortalReady(true);
  }, []);

  useEffect(() => {
    let visibleTimer: number | undefined;
    let hideTimer: number | undefined;

    if (open) {
      setIsMounted(true);
      visibleTimer = window.setTimeout(() => {
        setIsVisible(true);
      }, 20);
    } else {
      setIsVisible(false);
      hideTimer = window.setTimeout(() => {
        setIsMounted(false);
      }, CLOSE_MS);
    }

    return () => {
      if (visibleTimer !== undefined) {
        window.clearTimeout(visibleTimer);
      }

      if (hideTimer !== undefined) {
        window.clearTimeout(hideTimer);
      }
    };
  }, [open]);

  useEffect(() => {
    if (!isMounted || typeof document === "undefined") {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMounted, onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setExpandedSections({
      resumen: false,
      imagenes: false,
      atributos: false,
      variantes: false,
    });
  }, [detail?.id, open]);

  const imageUrls = useMemo(() => {
    if (!activeProduct) {
      return [];
    }

    return getProductDetailImageUrls(
      activeProduct.imagenes,
      detail?.variantes ?? [],
    );
  }, [activeProduct, detail?.variantes]);

  const attributes = detail?.atributos ?? [];
  const variants = detail?.variantes ?? [];
  const totalVariantStock = variants.reduce(
    (total, variant) => total + variant.cantidad,
    0,
  );

  if (!activeProduct || !isMounted || !isPortalReady || typeof window === "undefined") {
    return null;
  }

  function toggleSection(section: SectionId) {
    setExpandedSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-[140] flex items-center justify-center bg-slate-950/60 px-3 py-4 transition-opacity duration-200 sm:px-4 sm:py-6 ${
        isVisible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`flex max-h-[84vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--background)] shadow-[var(--shadow)] transition-all duration-300 ease-out ${
          isVisible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-4 scale-[0.98] opacity-0"
        }`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={activeProduct.nombre}
      >
        <div className="flex items-start justify-between gap-3 px-4 py-2.5 sm:px-5 sm:py-3">
          <div className="min-w-0 space-y-1">
            <p className="text-[10px] font-semibold tracking-[0.06em] text-[var(--muted)]">
              Detalle del producto
            </p>
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="truncate text-[1.05rem] font-semibold tracking-tight text-[var(--foreground-strong)] sm:text-[1.15rem]">
                {activeProduct.nombre}
              </h3>
              <StatusChip active={activeProduct.estado} />
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-[12px] text-[var(--muted)]">
              <span>{activeProduct.categoriaNombre}</span>
              <span className="text-[var(--line-strong)]">•</span>
              <span>{activeProduct.tiendaNombre}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] text-[var(--danger)] transition hover:bg-[var(--panel-muted)] hover:text-[var(--danger)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30"
            aria-label="Cerrar modal"
            title="Cerrar modal"
          >
            <span
              aria-hidden="true"
              className="inline-block h-5 w-5"
              style={{
                WebkitMaskImage: "url(/icons/cross.svg)",
                maskImage: "url(/icons/cross.svg)",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
                WebkitMaskSize: "contain",
                maskSize: "contain",
                backgroundColor: "currentColor",
              }}
            />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3.5 sm:px-5 sm:py-4">
          <div className="space-y-4">
            {isLoading && !detail ? <DetailSkeleton /> : null}

            {error && !detail ? (
              <div className="rounded-xl border border-[color:color-mix(in_srgb,var(--danger)_28%,transparent)] bg-[color:color-mix(in_srgb,var(--danger-soft)_76%,var(--panel-strong)_24%)] px-4 py-4 text-sm text-[color:color-mix(in_srgb,var(--danger)_84%,var(--foreground)_16%)]">
                <p>{error}</p>
                <button
                  type="button"
                  className="mt-3 rounded-lg border border-[color:color-mix(in_srgb,var(--danger)_28%,transparent)] px-3 py-2 text-sm font-medium text-[color:color-mix(in_srgb,var(--danger)_84%,var(--foreground)_16%)]"
                  onClick={onRetry}
                >
                  Reintentar detalle
                </button>
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
              <ProductMetric
                label="Precio desde"
                value={formatCurrency(activeProduct.precio, currency)}
                leadingIcon={
                  <span
                    aria-hidden="true"
                    className="inline-flex h-4.5 w-4.5 items-center justify-center text-[12px] font-bold leading-none"
                  >
                    $
                  </span>
                }
              />
              <ProductMetric
                label="Stock total"
                value={`${activeProduct.cantidad} unidades`}
                subvalue={detail ? undefined : "Datos ampliados pendientes"}
                leadingIcon={
                  <span
                    aria-hidden="true"
                    className="inline-block h-4.5 w-4.5"
                    style={{
                      WebkitMaskImage: "url(/icons/box.svg)",
                      maskImage: "url(/icons/box.svg)",
                      WebkitMaskRepeat: "no-repeat",
                      maskRepeat: "no-repeat",
                      WebkitMaskPosition: "center",
                      maskPosition: "center",
                      WebkitMaskSize: "contain",
                      maskSize: "contain",
                      backgroundColor: "currentColor",
                    }}
                  />
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
              <ProductMetric
                label="Categoría"
                value={activeProduct.categoriaNombre}
                leadingIcon={
                  <span
                    aria-hidden="true"
                    className="inline-block h-4.5 w-4.5"
                    style={{
                      WebkitMaskImage: "url(/icons/filter.svg)",
                      maskImage: "url(/icons/filter.svg)",
                      WebkitMaskRepeat: "no-repeat",
                      maskRepeat: "no-repeat",
                      WebkitMaskPosition: "center",
                      maskPosition: "center",
                      WebkitMaskSize: "contain",
                      maskSize: "contain",
                      backgroundColor: "currentColor",
                    }}
                  />
                }
              />
              <ProductMetric
                label="Tienda"
                value={activeProduct.tiendaNombre}
                leadingIcon={
                  <span
                    aria-hidden="true"
                    className="inline-block h-4.5 w-4.5"
                    style={{
                      WebkitMaskImage: "url(/icons/shop.svg)",
                      maskImage: "url(/icons/shop.svg)",
                      WebkitMaskRepeat: "no-repeat",
                      maskRepeat: "no-repeat",
                      WebkitMaskPosition: "center",
                      maskPosition: "center",
                      WebkitMaskSize: "contain",
                      maskSize: "contain",
                      backgroundColor: "currentColor",
                    }}
                  />
                }
              />
            </div>

            {activeProduct.descripcion.trim() ? (
              <SectionCard
                id="resumen"
                title="Resumen"
                subtitle="Descripcion y datos principales"
                open={expandedSections.resumen}
                onToggle={toggleSection}
              >
                <p className="text-sm leading-6 text-[var(--foreground)]">
                  {activeProduct.descripcion}
                </p>
              </SectionCard>
            ) : null}

            <SectionCard
              id="imagenes"
              title="Imagenes"
              subtitle={`${imageUrls.length} imagen${imageUrls.length === 1 ? "" : "es"} asociada${imageUrls.length === 1 ? "" : "s"}`}
              open={expandedSections.imagenes}
              onToggle={toggleSection}
              leadingIcon={
                <span
                  aria-hidden="true"
                  className="inline-block h-4.5 w-4.5"
                  style={{
                    WebkitMaskImage: "url(/icons/img-rectangle.svg)",
                    maskImage: "url(/icons/img-rectangle.svg)",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    WebkitMaskPosition: "center",
                    maskPosition: "center",
                    WebkitMaskSize: "contain",
                    maskSize: "contain",
                    backgroundColor: "currentColor",
                  }}
                />
              }
            >
              <ProductImageGallery
                key={activeProduct.id}
                productName={activeProduct.nombre}
                imageUrls={imageUrls}
              />
            </SectionCard>

            {attributes.length > 0 ? (
            <SectionCard
              id="atributos"
              title="Atributos"
              subtitle={`${attributes.length} bloque${attributes.length === 1 ? "" : "s"} de configuración`}
              open={expandedSections.atributos}
              onToggle={toggleSection}
              leadingIcon={
                <span
                  aria-hidden="true"
                  className="inline-block h-4.5 w-4.5"
                  style={{
                    WebkitMaskImage: "url(/icons/listcheck.svg)",
                    maskImage: "url(/icons/listcheck.svg)",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    WebkitMaskPosition: "center",
                    maskPosition: "center",
                    WebkitMaskSize: "contain",
                    maskSize: "contain",
                    backgroundColor: "currentColor",
                  }}
                />
              }
            >
            <div className="grid gap-2.5 lg:grid-cols-2">
              {attributes.map((attribute) => {
                    const values = getProductAttributeValues(attribute);
                    const colorMode = isProductColorAttribute(attribute);

                    return (
                      <article
                        key={attribute.id}
                        className="space-y-2.5 rounded-xl border border-[var(--line)] bg-[var(--background)] p-2.5"
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
                            <span className="rounded-lg border border-[color:color-mix(in_srgb,var(--accent)_28%,transparent)] bg-[var(--background)] px-2.5 py-1 text-[11px] font-semibold text-[var(--accent)]">
                              Color
                            </span>
                          ) : null}
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {values.map((value) => (
                            <AttributeValuePill key={value.id} value={value} />
                          ))}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </SectionCard>
            ) : null}

            {variants.length > 0 ? (
            <SectionCard
              id="variantes"
              title="Variantes"
              subtitle={`${variants.length} fila${variants.length === 1 ? "" : "s"} de combinaciones`}
              open={expandedSections.variantes}
              onToggle={toggleSection}
              leadingIcon={
                <span
                  aria-hidden="true"
                  className="inline-block h-4.5 w-4.5"
                  style={{
                    WebkitMaskImage: "url(/icons/layers.svg)",
                    maskImage: "url(/icons/layers.svg)",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    WebkitMaskPosition: "center",
                    maskPosition: "center",
                    WebkitMaskSize: "contain",
                    maskSize: "contain",
                    backgroundColor: "currentColor",
                  }}
                />
              }
            >
                <div className="space-y-3">
                  {variants.map((variant) => (
                    <ProductVariantRow
                      key={variant.id}
                      variant={variant}
                      currency={currency}
                    />
                  ))}
                </div>
              </SectionCard>
            ) : null}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
