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

function ProductDetailContent({ slug, productId }: ProductDetailViewProps) {
  const router = useRouter();
  const { addItem, totalItems } = useStoreCart();
  const [product, setProduct] = useState<PublicStoreProduct | null>(null);
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
      setProduct(productResult);
      setStore(catalogResult.tienda);
      setCurrency(catalogResult.tienda.moneda || "HNL");
      setQuantity(productResult.cantidadDisponible > 0 ? 1 : 0);
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
  const maxQuantity = useMemo(
    () => product?.cantidadDisponible ?? 0,
    [product],
  );
  const isOutOfStock = maxQuantity <= 0;
  const isFavorite = product ? favoriteIds.has(product.id) : false;

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

  if (isLoading) {
    return (
      <main
        className="min-h-screen bg-[var(--background)] px-4 py-8 md:px-8 lg:px-12"
        style={storeCatalogThemeTokens.light}
      >
        <div className="mx-auto max-w-6xl">
          <div className="h-[560px] rounded-[32px] border border-[var(--line)] bg-[var(--panel-strong)]" />
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main
        className="min-h-screen bg-[var(--background)] px-4 py-8 md:px-8 lg:px-12"
        style={storeCatalogThemeTokens.light}
      >
        <div className="mx-auto max-w-3xl space-y-4">
          <Link
            href={`/${encodeURIComponent(slug)}`}
            className="inline-flex rounded-2xl border border-[var(--line)] bg-[var(--panel-strong)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)]"
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

  return (
    <div
      className="bg-[var(--background)]"
      style={storeCatalogThemeTokens.light}
    >
      <main className="min-h-screen bg-[var(--background)] px-3 py-5 sm:px-4 sm:py-8 md:px-8 lg:px-12">
        <section className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-5">
          <header className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-[var(--line)] bg-[var(--panel-strong)] px-4 py-3 shadow-[var(--shadow)]">
            <Link
              href={`/${encodeURIComponent(slug)}`}
              className="inline-flex rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)]"
            >
              Volver al catalogo
            </Link>

            <div className="flex flex-wrap items-center gap-2">
              <StoreCartButton slug={slug} totalItems={totalItems} />
            </div>
          </header>

          <div className="grid gap-4 rounded-[28px] border border-[var(--line)] bg-[var(--panel)] p-3 shadow-[var(--shadow)] sm:gap-5 sm:p-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-6 lg:rounded-[34px] lg:p-5">
            <ProductImageGallery
              productName={product.nombre}
              imageUrls={product.imagenes}
            />

            <div className="space-y-4 rounded-[24px] border border-[var(--line)] bg-[var(--panel-strong)] p-4 sm:space-y-5 sm:rounded-[28px] sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex w-fit rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                  {product.categoria}
                </span>
                <button
                  type="button"
                  aria-label={
                    isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"
                  }
                  onClick={() => handleToggleFavorite(product)}
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-full border bg-[var(--panel-strong)] transition-all ${
                    isFavorite
                      ? "border-[#ffd2d0] text-[#e53935] shadow-[0_10px_20px_rgba(229,57,53,0.24)]"
                      : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--line-strong)]"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="h-5 w-5"
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
              <h1 className="text-[2.1rem] font-semibold leading-[1.08] tracking-[-0.03em] text-[var(--foreground-strong)] sm:text-3xl sm:leading-tight">
                {product.nombre}
              </h1>
              <p className="text-sm leading-6 text-[var(--muted)] sm:leading-7">
                {product.descripcion}
              </p>

              <div className="flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                <p className="text-[2.05rem] font-bold leading-none text-[var(--foreground-strong)] sm:text-3xl">
                  {formatCurrency(product.precio, currency)}
                </p>

                {product.cantidadDisponible > 0 ? (
                  <span className="rounded-full bg-[var(--success-soft)] px-3 py-1 text-xs font-semibold text-[var(--success)]">
                    Disponible ({product.cantidadDisponible})
                  </span>
                ) : (
                  <span className="rounded-full bg-[var(--danger-soft)] px-3 py-1 text-xs font-semibold text-[var(--danger)]">
                    Agotado
                  </span>
                )}
              </div>

              <div className="rounded-[22px] border border-[var(--line)] bg-[var(--panel-muted)] p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    Cantidad
                  </p>
                  <div className="inline-flex w-full items-center justify-between gap-2 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-2 sm:w-auto sm:justify-start">
                    <button
                      type="button"
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--panel-strong)] text-lg font-semibold text-[var(--foreground)] disabled:opacity-50"
                      onClick={() =>
                        setQuantity((current) => Math.max(current - 1, 1))
                      }
                      disabled={isOutOfStock || quantity <= 1}
                    >
                      -
                    </button>
                    <span className="min-w-0 flex-1 text-center text-sm font-semibold text-[var(--foreground)] sm:w-12 sm:flex-none">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--panel-strong)] text-lg font-semibold text-[var(--foreground)] disabled:opacity-50"
                      onClick={() =>
                        setQuantity((current) =>
                          Math.min(current + 1, Math.max(maxQuantity, 1)),
                        )
                      }
                      disabled={isOutOfStock || quantity >= maxQuantity}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
                <button
                  type="button"
                  disabled={isOutOfStock}
                  className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] disabled:opacity-50"
                  onClick={() => {
                    addItem({
                      productId: product.id,
                      nombre: product.nombre,
                      precio: product.precio,
                      cantidad: quantity,
                      cantidadDisponible: product.cantidadDisponible,
                      categoria: product.categoria,
                      imagenUrl: product.imagenes[0]?.trim() || null,
                    });
                  }}
                >
                  Agregar al carrito
                </button>
                <button
                  type="button"
                  disabled={isOutOfStock}
                  className="rounded-2xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white shadow-[var(--shadow)] disabled:opacity-50"
                  onClick={() => {
                    addItem({
                      productId: product.id,
                      nombre: product.nombre,
                      precio: product.precio,
                      cantidad: quantity,
                      cantidadDisponible: product.cantidadDisponible,
                      categoria: product.categoria,
                      imagenUrl: product.imagenes[0]?.trim() || null,
                    }, { notify: false });
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
