"use client";

import Link from "next/link";

import { formatCurrency } from "@/modules/core/lib/formatters";
import { FloatingWhatsAppButton } from "@/modules/store-catalog/components/FloatingWhatsAppButton";
import { ProductImageGallery } from "@/modules/store-catalog/components/ProductImageGallery";
import { RelatedProductsSection } from "@/modules/store-catalog/components/RelatedProductsSection";
import { StoreCartButton } from "@/modules/store-catalog/components/StoreCartButton";
import { StoreCatalogFooter } from "@/modules/store-catalog/components/StoreCatalogFooter";
import { storeCatalogThemeTokens } from "@/modules/store-catalog/lib/store-catalog-theme-tokens";
import type { PublicStoreProductAttribute } from "@/modules/store-catalog/types/store-catalog-types";
import type { ProductDetailViewModel } from "@/modules/store-catalog/hooks/useProductDetailView";
import {
  findAnyVariantForAttributeValue,
  getVariantAttributeValueId,
  getVariantImageUrl,
  hasAnyVariantForAttributeValue,
  isColorAttribute,
} from "@/modules/store-catalog/lib/product-detail.utils";

function ColorSwatch({ colorHexadecimal }: { colorHexadecimal: string }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-4 w-4 rounded-full border border-black/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)]"
      style={{ backgroundColor: colorHexadecimal }}
    />
  );
}

function ColorOptionCard({
  value,
  currency,
  isSelected,
  variant,
  canSelect,
  fallbackImageUrl,
  onSelect,
}: {
  value: NonNullable<
    PublicStoreProductAttribute["valores"]
  >[number];
  currency: string;
  isSelected: boolean;
  variant: ProductDetailViewModel["variants"][number] | null;
  canSelect: boolean;
  fallbackImageUrl: string | null;
  onSelect: () => void;
}) {
  const imageUrl = getVariantImageUrl(variant) ?? fallbackImageUrl;
  const isAvailable = canSelect;
  const isInStock = Boolean(variant && variant.cantidad > 0);

  return (
    <button
      type="button"
      disabled={!isAvailable}
      onClick={onSelect}
      className={`group min-h-0 overflow-hidden rounded-2xl border bg-[var(--panel)] text-left transition active:scale-[0.98] sm:min-h-[9rem] sm:active:scale-100 ${
        isSelected
          ? "border-[var(--accent)] shadow-[0_0_0_2px_var(--accent-soft)] ring-2 ring-[#2563EB]/15"
          : "border-[var(--line)] hover:border-[var(--line-strong)] hover:shadow-[var(--shadow)]"
      } disabled:cursor-not-allowed disabled:opacity-45`}
    >
      <div className="aspect-square bg-[var(--panel-muted)] sm:aspect-[4/3]">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={value.valor}
            className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            {value.colorHexadecimal ? (
              <span
                className="h-8 w-8 rounded-full border border-black/10 shadow-inner sm:h-12 sm:w-12"
                style={{ backgroundColor: value.colorHexadecimal }}
              />
            ) : (
              <span className="text-xs font-semibold text-[var(--muted)]">
                Sin imagen
              </span>
            )}
          </div>
        )}
      </div>

      <div className="space-y-0.5 p-2 sm:space-y-1 sm:p-2.5">
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5">
            {value.colorHexadecimal ? (
              <ColorSwatch colorHexadecimal={value.colorHexadecimal} />
            ) : null}
            <span className="line-clamp-1 text-xs font-semibold text-[var(--foreground)]">
              {value.valor}
            </span>
          </div>
          {isSelected ? (
            <span className="shrink-0 rounded-full bg-[#EEF4FF] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#2563EB]">
              Activo
            </span>
          ) : null}
        </div>
        <p className="hidden text-xs font-bold text-[var(--foreground-strong)] sm:block sm:text-sm">
          {variant ? formatCurrency(variant.precio, currency) : "No disponible"}
        </p>
        <p
          className={`hidden text-[10px] font-semibold sm:block sm:text-[11px] ${
            isInStock ? "text-[var(--success)]" : "text-[var(--muted)]"
          }`}
        >
          {isInStock ? `Disponible (${variant?.cantidad})` : "Agotado"}
        </p>
      </div>
    </button>
  );
}

export function ProductDetailPage(viewModel: ProductDetailViewModel) {
  const {
    slug,
    product,
    store,
    currency,
    totalItems,
    favoriteIds,
    isFavorite,
    variants,
    activeVariant,
    selectedVariant,
    imageUrls,
    attributeInfoByIndex,
    summaryProduct,
    quantity,
    maxQuantity,
    isOutOfStock,
    handleGalleryImageSelect,
    handleToggleFavorite,
    handleAttributeSelect,
    handleDecreaseQuantity,
    handleIncreaseQuantity,
    handleAddToCart,
    handleBuyNow,
  } = viewModel;

  return (
    <div className="bg-[var(--background)]" style={storeCatalogThemeTokens.light}>
      <main className="min-h-screen bg-[var(--background)] pb-4 pt-0 sm:pb-6 sm:pt-0">
        <header className="overflow-hidden rounded-b-3xl bg-[linear-gradient(135deg,#2563EB_0%,#1D4ED8_60%,#1E3A8A_100%)] shadow-[0_16px_38px_rgba(37,99,235,0.16)] sm:rounded-b-[32px] sm:shadow-[0_20px_50px_rgba(37,99,235,0.18)] lg:rounded-none">
          <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-3 px-3 py-2.5 sm:px-5 sm:py-3 lg:px-6">
            <Link
              href={`/${encodeURIComponent(slug)}`}
              className="inline-flex shrink-0 items-center rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white shadow-[0_8px_18px_rgba(15,23,42,0.1)] backdrop-blur-sm transition hover:bg-white/20 sm:px-4 sm:py-2 sm:text-sm sm:shadow-[0_10px_24px_rgba(15,23,42,0.12)]"
            >
              Volver al catalogo
            </Link>

            <div className="flex shrink-0 items-center gap-2">
              <StoreCartButton
                slug={slug}
                totalItems={totalItems}
                className="border-white/25 bg-white text-[#2563EB] shadow-[0_10px_24px_rgba(15,23,42,0.12)]"
              />
            </div>
          </div>
        </header>

        <section className="mx-auto w-full max-w-[1440px] space-y-4 px-3 pt-3 sm:space-y-5 sm:px-6 sm:pt-5 lg:px-8">
          <div className="grid gap-3 sm:gap-4 lg:grid-cols-[minmax(0,1.06fr)_minmax(0,0.94fr)] lg:gap-6">
            <ProductImageGallery
              key={selectedVariant?.id ?? product.id}
              productName={product.nombre}
              imageUrls={imageUrls}
              onImageSelect={handleGalleryImageSelect}
            />

            <div className="space-y-3 rounded-2xl border border-[#dbe7ff] bg-white p-3 shadow-[0_12px_28px_rgba(15,23,42,0.05)] sm:space-y-5 sm:rounded-[34px] sm:p-5 sm:shadow-[0_18px_40px_rgba(15,23,42,0.06)] lg:sticky lg:top-4 lg:self-start">
              <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                <span className="inline-flex w-fit rounded-full border border-[#dbe7ff] bg-[#EEF4FF] px-2.5 py-1 text-[11px] font-semibold text-[#2563EB] sm:px-3 sm:text-xs">
                  {product.categoria}
                </span>
                <button
                  type="button"
                  aria-label={
                    isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"
                  }
                  onClick={() => handleToggleFavorite(summaryProduct)}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md transition-all sm:h-10 sm:w-10 ${
                    isFavorite
                      ? "border-[#ffd2d0] bg-white text-[#e53935] shadow-[0_10px_20px_rgba(229,57,53,0.18)]"
                      : "border-[#dbe7ff] bg-white text-[var(--muted)] hover:border-[#9bb8ff]"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="h-[18px] w-[18px] sm:h-5 sm:w-5"
                    style={{
                      WebkitMaskImage: "url(/icons/heart.svg)",
                      maskImage: "url(/icons/heart.svg)",
                      WebkitMaskRepeat: "no-repeat",
                      maskRepeat: "no-repeat",
                      WebkitMaskPosition: "center",
                      maskPosition: "center",
                      WebkitMaskSize: "contain",
                      maskSize: "contain",
                      backgroundColor: "currentColor",
                      opacity: isFavorite ? 1 : 0.84,
                    }}
                  />
                </button>
              </div>
              <h2 className="text-[1.25rem] font-semibold leading-[1.16] text-[var(--foreground-strong)] sm:text-3xl sm:leading-tight sm:tracking-[-0.03em]">
                {product.nombre}
              </h2>
              {product.descripcion.trim() ? (
                <div className="space-y-1.5 sm:rounded-[22px] sm:border sm:border-[#dbe7ff] sm:bg-[#F8FBFF] sm:p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#64748B] sm:text-sm sm:tracking-[0.16em]">
                    Descripcion
                  </p>
                  <p className="text-sm leading-5 text-[var(--foreground)] sm:mt-2 sm:leading-7">
                    {product.descripcion}
                  </p>
                </div>
              ) : null}

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <p className="text-[1.45rem] font-bold leading-none text-[#2563EB] sm:text-3xl sm:tracking-[-0.03em]">
                  {formatCurrency(selectedVariant?.precio ?? 0, currency)}
                </p>

                {selectedVariant && selectedVariant.cantidad > 0 ? (
                  <span className="rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[11px] font-semibold text-[#059669] sm:px-3 sm:text-xs">
                    Disponible ({selectedVariant.cantidad})
                  </span>
                ) : (
                  <span className="rounded-full bg-[#FEF2F2] px-2.5 py-1 text-[11px] font-semibold text-[#DC2626] sm:px-3 sm:text-xs">
                    Agotado
                  </span>
                )}
              </div>

              {attributeInfoByIndex.length > 0 ? (
                <div className="space-y-3 rounded-2xl border border-[#dbe7ff] bg-[#F8FBFF] p-2.5 sm:rounded-[24px] sm:p-4">
                  {attributeInfoByIndex.map((attributeInfo, index) => {
                    const { attribute, label, values, selectedValueId, isLocked } =
                      attributeInfo;
                    const forcedSelectedValueId =
                      index <= 1
                        ? getVariantAttributeValueId(
                            activeVariant,
                            attribute.atributoCatalogoId,
                          )
                        : null;
                    const selectedAttributeValue = values.find(
                      (value) =>
                        value.atributoCatalogoValorId ===
                        (forcedSelectedValueId ?? selectedValueId),
                    );
                    const shouldRenderColorCards = isColorAttribute(attribute);
                    const previousAttributeLabel =
                      index > 0
                        ? attributeInfoByIndex[index - 1]?.label ??
                          "la opción anterior"
                        : null;

                    return (
                      <div
                        key={attribute.atributoCatalogoId}
                        className="space-y-2 sm:space-y-2.5"
                      >
                        <div className="flex flex-wrap items-baseline gap-1.5">
                          <p className="text-xs font-semibold text-[var(--foreground-strong)] sm:text-sm">
                            {label}
                          </p>
                          {selectedAttributeValue ? (
                            <span className="text-xs font-semibold text-[#2563EB] sm:text-sm">
                              {selectedAttributeValue.valor}
                            </span>
                          ) : (
                            <span className="text-xs text-[var(--muted)] sm:text-sm">
                              Selecciona una opción
                            </span>
                          )}
                        </div>

                        {isLocked ? (
                          <div className="rounded-2xl border border-dashed border-[#dbe7ff] bg-white px-3 py-2 text-xs text-[var(--muted)] sm:px-4 sm:py-3 sm:text-sm">
                            Selecciona {previousAttributeLabel} para ver los valores
                            disponibles.
                          </div>
                        ) : shouldRenderColorCards ? (
                          <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-3 sm:gap-2 xl:grid-cols-4">
                            {values.map((value) => {
                              const isSelected =
                                (forcedSelectedValueId ?? selectedValueId) ===
                                value.atributoCatalogoValorId;
                              const optionVariant = findAnyVariantForAttributeValue(
                                variants,
                                attribute.atributoCatalogoId,
                                value.atributoCatalogoValorId,
                              );
                              const canSelect = hasAnyVariantForAttributeValue(
                                variants,
                                attribute.atributoCatalogoId,
                                value.atributoCatalogoValorId,
                              );

                              return (
                                <ColorOptionCard
                                  key={value.atributoCatalogoValorId}
                                  value={value}
                                  currency={currency}
                                  isSelected={isSelected}
                                  variant={optionVariant}
                                  canSelect={canSelect}
                                  fallbackImageUrl={imageUrls[0] ?? null}
                                  onSelect={() =>
                                    handleAttributeSelect(
                                      attribute.atributoCatalogoId,
                                      value.atributoCatalogoValorId,
                                    )
                                  }
                                />
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {values.map((value) => {
                              const isSelected =
                                (forcedSelectedValueId ?? selectedValueId) ===
                                value.atributoCatalogoValorId;
                              const isAvailable = hasAnyVariantForAttributeValue(
                                variants,
                                attribute.atributoCatalogoId,
                                value.atributoCatalogoValorId,
                              );

                              return (
                                <button
                                  key={value.atributoCatalogoValorId}
                                  type="button"
                                  disabled={!isAvailable}
                                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-semibold transition active:scale-[0.98] sm:gap-2 sm:px-3 sm:text-xs sm:active:scale-100 ${
                                    isSelected
                                      ? "border-[#2563EB] bg-[#EEF4FF] text-[#2563EB] ring-2 ring-[#2563EB]/15 shadow-[0_0_0_1px_rgba(37,99,235,0.12)]"
                                      : "border-[#dbe7ff] bg-white text-[var(--foreground)]"
                                  } disabled:cursor-not-allowed disabled:opacity-45`}
                                  onClick={() =>
                                    handleAttributeSelect(
                                      attribute.atributoCatalogoId,
                                      value.atributoCatalogoValorId,
                                    )
                                  }
                                >
                                  {value.colorHexadecimal ? (
                                    <ColorSwatch colorHexadecimal={value.colorHexadecimal} />
                                  ) : null}
                                  {value.valor}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : null}

              <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] p-2.5 sm:rounded-[24px] sm:p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-medium text-[var(--foreground)] sm:text-sm">
                    Cantidad
                  </p>
                  <div className="inline-flex items-center justify-between gap-2 rounded-2xl border border-[#dbe7ff] bg-white p-1.5 sm:w-auto sm:justify-start sm:p-2">
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#dbe7ff] bg-[#F8FBFF] text-lg font-semibold text-[var(--foreground)] disabled:opacity-50 sm:h-9 sm:w-9"
                      onClick={handleDecreaseQuantity}
                      disabled={isOutOfStock || quantity <= 1}
                    >
                      <span
                        aria-hidden="true"
                        className="h-4 w-4 text-[#2563EB] sm:h-5 sm:w-5"
                        style={{
                          WebkitMaskImage: "url(/icons/minus-circle.svg)",
                          maskImage: "url(/icons/minus-circle.svg)",
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
                    <span className="w-9 text-center text-sm font-semibold text-[var(--foreground)] sm:w-12">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#dbe7ff] bg-[#F8FBFF] text-lg font-semibold text-[var(--foreground)] disabled:opacity-50 sm:h-9 sm:w-9"
                      onClick={handleIncreaseQuantity}
                      disabled={isOutOfStock || quantity >= maxQuantity}
                    >
                      <span
                        aria-hidden="true"
                        className="h-4 w-4 text-[#2563EB] sm:h-5 sm:w-5"
                        style={{
                          WebkitMaskImage: "url(/icons/plus-circle.svg)",
                          maskImage: "url(/icons/plus-circle.svg)",
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
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
                <button
                  type="button"
                  disabled={isOutOfStock || !selectedVariant}
                  className="rounded-full border border-[#dbe7ff] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] shadow-[0_8px_18px_rgba(15,23,42,0.05)] transition active:scale-[0.985] hover:border-[#9bb8ff] hover:bg-[#F8FBFF] disabled:opacity-50 sm:py-3 sm:shadow-[0_10px_24px_rgba(15,23,42,0.06)] sm:active:scale-100"
                  onClick={handleAddToCart}
                >
                  Agregar al carrito
                </button>
                <button
                  type="button"
                  disabled={isOutOfStock || !selectedVariant}
                  className="rounded-full bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(37,99,235,0.2)] transition active:scale-[0.985] hover:brightness-105 disabled:opacity-50 sm:py-3 sm:shadow-[0_14px_30px_rgba(37,99,235,0.22)] sm:active:scale-100"
                  onClick={handleBuyNow}
                >
                  Comprar ahora
                </button>
              </div>
            </div>
          </div>

          <RelatedProductsSection
            slug={slug}
            categoryName={product.categoria}
            currentProductId={product.id}
            currency={currency}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
          />
        </section>

        <FloatingWhatsAppButton phone={store?.telefono} />
      </main>

      <StoreCatalogFooter storeName={store?.nombre} phone={store?.telefono} />
    </div>
  );
}
