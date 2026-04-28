"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { formatCurrency } from "@/modules/core/lib/formatters";
import { FloatingWhatsAppButton } from "@/modules/store-catalog/components/FloatingWhatsAppButton";
import { ProductImageGallery } from "@/modules/store-catalog/components/ProductImageGallery";
import { RelatedProductsSection } from "@/modules/store-catalog/components/RelatedProductsSection";
import { StoreCartButton } from "@/modules/store-catalog/components/StoreCartButton";
import { StoreCatalogFooter } from "@/modules/store-catalog/components/StoreCatalogFooter";
import { storeCatalogThemeTokens } from "@/modules/store-catalog/lib/store-catalog-theme-tokens";
import {
  readStoreFavorites,
  writeStoreFavorites,
  type StoreFavoriteProduct,
} from "@/modules/store-catalog/lib/store-favorites-storage";
import { usePublicStoreLightMode } from "@/modules/store-catalog/lib/use-public-store-light-mode";
import {
  StoreCartProvider,
  useStoreCart,
} from "@/modules/store-catalog/providers/StoreCartProvider";
import {
  fetchPublicStoreProductById,
  fetchPublicStoreProducts,
} from "@/modules/store-catalog/services/store-catalog-service";
import type {
  PublicStoreProduct,
  PublicStoreProductAttribute,
  PublicStoreProductAttributeValue,
  PublicStoreProductDetail,
  PublicStoreProductVariant,
  PublicStoreSummary,
} from "@/modules/store-catalog/types/store-catalog-types";

type ProductDetailViewProps = {
  slug: string;
  productId: number;
};

function toFavoriteProduct(product: PublicStoreProduct): StoreFavoriteProduct {
  return {
    id: product.id,
    nombre: product.nombre,
    categoria: product.categoria,
    precio: product.precio,
    cantidadDisponible: product.cantidadDisponible,
    imagenUrl: product.imagenes[0]?.trim() || null,
  };
}

function buildVariantSummary(variant: PublicStoreProductVariant) {
  return variant.valores.map((value) => value.valor).join(" / ");
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

function isColorAttribute(attribute: PublicStoreProductAttribute) {
  return (
    attribute.nombre.trim().toLowerCase().includes("color") ||
    attribute.valores.some((value) => Boolean(value.colorHexadecimal))
  );
}

function getVariantImageUrl(variant: PublicStoreProductVariant | null) {
  if (!variant) {
    return null;
  }

  return (
    variant.imagenes.find((image) => image.trim())?.trim() ||
    variant.urlImagenPrincipal?.trim() ||
    null
  );
}

function buildImageSet(
  selectedVariant: PublicStoreProductVariant | null,
  allVariants: PublicStoreProductVariant[],
) {
  const preferred = (selectedVariant?.imagenes.length
    ? selectedVariant.imagenes
    : selectedVariant?.urlImagenPrincipal
      ? [selectedVariant.urlImagenPrincipal]
      : []
  ).map((image) => image.trim());

  const fallback = allVariants
    .flatMap((variant) =>
      variant.imagenes.length > 0
        ? variant.imagenes
        : variant.urlImagenPrincipal
          ? [variant.urlImagenPrincipal]
          : [],
    )
    .map((image) => image.trim());

  return [...preferred, ...fallback].filter((image, index, values) => {
    return image.length > 0 && values.indexOf(image) === index;
  });
}

function findAnyVariantForAttributeValue(
  variants: PublicStoreProductVariant[],
  attributeId: number,
  valueId: number,
) {
  return (
    variants.find((variant) =>
      variant.valores.some(
        (value) =>
          value.atributoCatalogoId === attributeId &&
          value.atributoCatalogoValorId === valueId,
      ),
    ) ?? null
  );
}

function hasAnyVariantForAttributeValue(
  variants: PublicStoreProductVariant[],
  attributeId: number,
  valueId: number,
) {
  return variants.some((variant) =>
    variant.valores.some(
      (value) =>
        value.atributoCatalogoId === attributeId &&
        value.atributoCatalogoValorId === valueId,
    ),
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
  value: PublicStoreProductAttributeValue;
  currency: string;
  isSelected: boolean;
  variant: PublicStoreProductVariant | null;
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
          ? "border-[var(--accent)] shadow-[0_0_0_2px_var(--accent-soft)]"
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
        <div className="flex items-center gap-1.5">
          {value.colorHexadecimal ? (
            <ColorSwatch colorHexadecimal={value.colorHexadecimal} />
          ) : null}
          <span className="line-clamp-1 text-xs font-semibold text-[var(--foreground)]">
            {value.valor}
          </span>
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

function ProductDetailContent({ slug, productId }: ProductDetailViewProps) {
  const router = useRouter();
  const { addItem, totalItems } = useStoreCart();
  const [product, setProduct] = useState<PublicStoreProductDetail | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState("HNL");
  const [store, setStore] = useState<PublicStoreSummary | null>(null);
  const [favoriteItems, setFavoriteItems] = useState<StoreFavoriteProduct[]>(
    [],
  );
  const [favoritesLoadedSlug, setFavoritesLoadedSlug] = useState<string | null>(
    null,
  );
  const [selectedValues, setSelectedValues] = useState<Record<number, number>>(
    {},
  );

  usePublicStoreLightMode();

  useEffect(() => {
    setFavoriteItems(readStoreFavorites(slug));
    setFavoritesLoadedSlug(slug);
  }, [slug]);

  useEffect(() => {
    if (favoritesLoadedSlug !== slug) {
      return;
    }

    writeStoreFavorites(slug, favoriteItems);
  }, [favoriteItems, favoritesLoadedSlug, slug]);

  const loadProduct = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [productResult, catalogResult] = await Promise.all([
        fetchPublicStoreProductById(slug, productId),
        fetchPublicStoreProducts({ slug, page: 1, pageSize: 1 }),
      ]);

      const firstVariant =
        productResult.variantes.find(
          (variant) => variant.estado && variant.cantidad > 0,
        ) ?? productResult.variantes[0];

      setProduct(productResult);
      setStore(catalogResult.tienda);
      setCurrency(catalogResult.tienda.moneda || "HNL");
      setSelectedValues(
        firstVariant
          ? firstVariant.valores.reduce<Record<number, number>>(
              (accumulator, value) => {
                accumulator[value.atributoCatalogoId] =
                  value.atributoCatalogoValorId;
                return accumulator;
              },
              {},
            )
          : {},
      );
      setQuantity(firstVariant?.cantidad && firstVariant.cantidad > 0 ? 1 : 0);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudo cargar este producto.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [productId, slug]);

  useEffect(() => {
    void loadProduct();
  }, [loadProduct]);

  const favoriteIds = useMemo(
    () => new Set(favoriteItems.map((item) => item.id)),
    [favoriteItems],
  );
  const isFavorite = product ? favoriteIds.has(product.id) : false;

  const variants = useMemo(
    () => product?.variantes.filter((variant) => variant.estado) ?? [],
    [product],
  );

  const selectedVariant = useMemo(() => {
    if (!product) {
      return null;
    }

    return (
      variants.find((variant) =>
        variant.valores.every(
          (value) =>
            selectedValues[value.atributoCatalogoId] ===
            value.atributoCatalogoValorId,
        ),
      ) ?? null
    );
  }, [product, selectedValues, variants]);

  useEffect(() => {
    if (!selectedVariant) {
      setQuantity(0);
      return;
    }

    setQuantity((current) => {
      if (selectedVariant.cantidad <= 0) {
        return 0;
      }

      if (current <= 0) {
        return 1;
      }

      return Math.min(current, selectedVariant.cantidad);
    });
  }, [selectedVariant]);

  const imageUrls = useMemo(
    () => buildImageSet(selectedVariant, variants),
    [selectedVariant, variants],
  );

  const handleToggleFavorite = useCallback(
    (targetProduct: PublicStoreProduct) => {
      const favorite = toFavoriteProduct(targetProduct);

      setFavoriteItems((currentItems) => {
        const exists = currentItems.some((item) => item.id === favorite.id);
        if (exists) {
          return currentItems.filter((item) => item.id !== favorite.id);
        }

        return [favorite, ...currentItems];
      });
    },
    [],
  );

  const handleAttributeSelect = useCallback(
    (attributeId: number, valueId: number) => {
      const compatibleVariants = variants.filter((variant) =>
        variant.valores.some(
          (value) =>
            value.atributoCatalogoId === attributeId &&
            value.atributoCatalogoValorId === valueId,
        ),
      );

      const prioritizedVariant =
        compatibleVariants.find((variant) =>
          variant.valores.every((value) => {
            if (value.atributoCatalogoId === attributeId) {
              return value.atributoCatalogoValorId === valueId;
            }

            const selected = selectedValues[value.atributoCatalogoId];
            return !selected || selected === value.atributoCatalogoValorId;
          }),
        ) ??
        compatibleVariants.find((variant) => variant.cantidad > 0) ??
        compatibleVariants[0];

      if (!prioritizedVariant) {
        return;
      }

      setSelectedValues(
        prioritizedVariant.valores.reduce<Record<number, number>>(
          (accumulator, value) => {
            accumulator[value.atributoCatalogoId] = value.atributoCatalogoValorId;
            return accumulator;
          },
          {},
        ),
      );
    },
    [selectedValues, variants],
  );

  if (isLoading) {
    return (
      <main
        className="min-h-screen bg-[var(--background)] px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
        style={storeCatalogThemeTokens.light}
      >
        <div className="mx-auto max-w-6xl">
          <div className="h-[560px] rounded-[32px] border border-[#dbe7ff] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]" />
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main
        className="min-h-screen bg-[var(--background)] px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
        style={storeCatalogThemeTokens.light}
      >
        <div className="mx-auto max-w-3xl space-y-4">
          <Link
            href={`/${encodeURIComponent(slug)}`}
            className="inline-flex rounded-full border border-[#dbe7ff] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
          >
            Volver al catalogo
          </Link>
          <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
            {error ?? "No se encontro el producto solicitado."}
          </p>
        </div>
      </main>
    );
  }

  const summaryProduct: PublicStoreProduct = {
    id: product.id,
    nombre: product.nombre,
    descripcion: product.descripcion,
    precio: selectedVariant?.precio ?? 0,
    cantidadDisponible: selectedVariant?.cantidad ?? 0,
    categoria: product.categoria,
    imagenes: imageUrls,
  };

  const maxQuantity = selectedVariant?.cantidad ?? 0;
  const isOutOfStock = !selectedVariant || maxQuantity <= 0;

  return (
    <div
      className="bg-[var(--background)]"
      style={storeCatalogThemeTokens.light}
    >
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

                {!selectedVariant ? (
                  <span className="rounded-full bg-[#FEF2F2] px-2.5 py-1 text-[11px] font-semibold text-[#DC2626] sm:px-3 sm:text-xs">
                    Selecciona una variante
                  </span>
                ) : selectedVariant.cantidad > 0 ? (
                  <span className="rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[11px] font-semibold text-[#059669] sm:px-3 sm:text-xs">
                    Disponible ({selectedVariant.cantidad})
                  </span>
                ) : (
                  <span className="rounded-full bg-[#FEF2F2] px-2.5 py-1 text-[11px] font-semibold text-[#DC2626] sm:px-3 sm:text-xs">
                    Agotado
                  </span>
                )}
              </div>

              {product.atributos.length > 0 ? (
                <div className="space-y-3 rounded-2xl border border-[#dbe7ff] bg-[#F8FBFF] p-2.5 sm:rounded-[24px] sm:p-4">
                  {product.atributos.map((attribute) => {
                    const selectedValueId =
                      selectedValues[attribute.atributoCatalogoId];
                    const selectedAttributeValue = attribute.valores.find(
                      (value) =>
                        value.atributoCatalogoValorId === selectedValueId,
                    );
                    const shouldRenderColorCards = isColorAttribute(attribute);

                    return (
                      <div
                        key={attribute.atributoCatalogoId}
                        className="space-y-2 sm:space-y-2.5"
                      >
                        <div className="flex flex-wrap items-baseline gap-1.5">
                          <p className="text-xs font-semibold text-[var(--foreground-strong)] sm:text-sm">
                            {attribute.nombre}
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

                        {shouldRenderColorCards ? (
                          <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-3 sm:gap-2 xl:grid-cols-4">
                              {attribute.valores.map((value) => {
                                const isSelected =
                                  selectedValueId ===
                                  value.atributoCatalogoValorId;
                                const optionVariant =
                                  findAnyVariantForAttributeValue(
                                    variants,
                                    attribute.atributoCatalogoId,
                                    value.atributoCatalogoValorId,
                                  );
                                const canSelect =
                                  hasAnyVariantForAttributeValue(
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
                              {attribute.valores.map((value) => {
                                const isSelected =
                                  selectedValueId ===
                                  value.atributoCatalogoValorId;
                                const isAvailable =
                                  hasAnyVariantForAttributeValue(
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
                                      ? "border-[#2563EB] bg-[#EEF4FF] text-[#2563EB]"
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
                                    <ColorSwatch
                                      colorHexadecimal={value.colorHexadecimal}
                                    />
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
                      onClick={() =>
                        setQuantity((current) => Math.max(current - 1, 1))
                      }
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
                      onClick={() =>
                        setQuantity((current) =>
                          Math.min(current + 1, Math.max(maxQuantity, 1)),
                        )
                      }
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
                  onClick={() => {
                    if (!selectedVariant) {
                      return;
                    }

                    addItem({
                      productId: product.id,
                      productoVarianteId: selectedVariant.id,
                      nombre: product.nombre,
                      precio: selectedVariant.precio,
                      cantidad: quantity,
                      cantidadDisponible: selectedVariant.cantidad,
                      categoria: product.categoria,
                      imagenUrl: imageUrls[0]?.trim() || null,
                      varianteResumen: buildVariantSummary(selectedVariant),
                    });
                  }}
                >
                  Agregar al carrito
                </button>
                <button
                  type="button"
                  disabled={isOutOfStock || !selectedVariant}
                  className="rounded-full bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(37,99,235,0.2)] transition active:scale-[0.985] hover:brightness-105 disabled:opacity-50 sm:py-3 sm:shadow-[0_14px_30px_rgba(37,99,235,0.22)] sm:active:scale-100"
                  onClick={() => {
                    if (!selectedVariant) {
                      return;
                    }

                    addItem(
                      {
                        productId: product.id,
                        productoVarianteId: selectedVariant.id,
                        nombre: product.nombre,
                        precio: selectedVariant.precio,
                        cantidad: quantity,
                        cantidadDisponible: selectedVariant.cantidad,
                        categoria: product.categoria,
                        imagenUrl: imageUrls[0]?.trim() || null,
                        varianteResumen: buildVariantSummary(selectedVariant),
                      },
                      { notify: false },
                    );
                    router.push(`/${encodeURIComponent(slug)}/carrito`);
                  }}
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

export function ProductDetailView({ slug, productId }: ProductDetailViewProps) {
  return (
    <StoreCartProvider slug={slug}>
      <ProductDetailContent slug={slug} productId={productId} />
    </StoreCartProvider>
  );
}
