"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { formatCurrency } from "@/modules/core/lib/formatters";
import { FloatingWhatsAppButton } from "@/modules/store-catalog/components/FloatingWhatsAppButton";
import { ProductImageGallery } from "@/modules/store-catalog/components/ProductImageGallery";
import { RelatedProductsSection } from "@/modules/store-catalog/components/RelatedProductsSection";
import { StoreCartButton } from "@/modules/store-catalog/components/StoreCartButton";
import { StoreCatalogFooter } from "@/modules/store-catalog/components/StoreCatalogFooter";
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

const lightCatalogTheme = {
  "--background": "#f3f0ea",
  "--background-soft": "#fbf7f1",
  "--foreground": "#2c241b",
  "--foreground-strong": "#1b160f",
  "--panel": "rgba(255, 251, 245, 0.94)",
  "--panel-muted": "rgba(243, 235, 223, 0.92)",
  "--panel-strong": "rgba(255, 255, 255, 0.98)",
  "--line": "rgba(92, 74, 51, 0.12)",
  "--line-strong": "rgba(143, 118, 84, 0.28)",
  "--muted": "#726553",
  "--accent": "#1f1912",
  "--accent-strong": "#16110b",
  "--accent-soft": "rgba(31, 25, 18, 0.08)",
  "--success": "#227447",
  "--success-soft": "rgba(34, 116, 71, 0.12)",
  "--danger": "#b54235",
  "--danger-soft": "rgba(181, 66, 53, 0.12)",
  "--warning": "#a56a1f",
  "--warning-soft": "rgba(165, 106, 31, 0.12)",
  "--shadow": "0 24px 60px rgba(35, 28, 20, 0.08)",
} as CSSProperties;

function ProductDetailContent({ slug, productId }: ProductDetailViewProps) {
  const router = useRouter();
  const { addItem, totalItems } = useStoreCart();
  const [product, setProduct] = useState<PublicStoreProduct | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState("HNL");
  const [store, setStore] = useState<PublicStoreSummary | null>(null);

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

  const maxQuantity = useMemo(() => product?.cantidadDisponible ?? 0, [product]);
  const isOutOfStock = maxQuantity <= 0;

  if (isLoading) {
    return (
      <main
        className="min-h-screen bg-[#f3f0ea] px-4 py-8 md:px-8 lg:px-12"
        style={lightCatalogTheme}
      >
        <div className="mx-auto max-w-6xl">
          <div className="h-[560px] rounded-[32px] border border-[#e4d9cb] bg-white/80" />
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main
        className="min-h-screen bg-[#f3f0ea] px-4 py-8 md:px-8 lg:px-12"
        style={lightCatalogTheme}
      >
        <div className="mx-auto max-w-3xl space-y-4">
          <Link
            href={`/${encodeURIComponent(slug)}`}
            className="inline-flex rounded-2xl border border-[#d8cbb9] bg-white px-4 py-2.5 text-sm font-semibold text-[#1f1912]"
          >
            Volver al catalogo
          </Link>
          <p className="rounded-2xl border border-[#f0c8c4] bg-[#fff1ef] px-4 py-3 text-sm text-[#9d3d34]">
            {error ?? "No se encontro el producto solicitado."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      <main
        className="min-h-screen bg-[#f3f0ea] px-4 py-8 md:px-8 lg:px-12"
        style={lightCatalogTheme}
      >
        <section className="mx-auto w-full max-w-7xl space-y-5">
          <header className="flex items-center justify-between gap-3 rounded-[28px] border border-[#e7ddcf] bg-[#fbf8f2] px-4 py-3 shadow-[0_16px_36px_rgba(40,32,23,0.06)]">
            <Link
              href={`/${encodeURIComponent(slug)}`}
              className="inline-flex rounded-2xl border border-[#d8cbb9] bg-white px-4 py-2.5 text-sm font-semibold text-[#1f1912]"
            >
              Volver al catalogo
            </Link>

            <StoreCartButton slug={slug} totalItems={totalItems} />
          </header>

          <div className="grid gap-6 rounded-[34px] border border-[#e7ddcf] bg-[#fbf7f1] p-5 shadow-[0_24px_60px_rgba(35,28,20,0.08)] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <ProductImageGallery
              productName={product.nombre}
              imageUrls={product.imagenes}
            />

            <div className="space-y-5 rounded-[28px] bg-white/78 p-5">
              <span className="inline-flex w-fit rounded-full bg-[#f3ede4] px-3 py-1 text-xs font-semibold text-[#1f1912]">
                {product.categoria}
              </span>
              <h1 className="text-3xl font-semibold text-[#1b160f]">
                {product.nombre}
              </h1>
              <p className="text-sm leading-7 text-[#6e6254]">
                {product.descripcion}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <p className="text-3xl font-bold text-[#1f1912]">
                  {formatCurrency(product.precio, currency)}
                </p>

                {product.cantidadDisponible > 0 ? (
                  <span className="rounded-full bg-[#edf7ef] px-3 py-1 text-xs font-semibold text-[#227447]">
                    Disponible ({product.cantidadDisponible})
                  </span>
                ) : (
                  <span className="rounded-full bg-[#fff0ef] px-3 py-1 text-xs font-semibold text-[#b54235]">
                    Agotado
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-[#2c241b]">Cantidad</p>
                <div className="inline-flex items-center gap-2 rounded-2xl border border-[#ddd2c5] bg-[#f5efe6] p-2">
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#d8cbb9] bg-white text-lg font-semibold text-[#1f1912] disabled:opacity-50"
                    onClick={() => setQuantity((current) => Math.max(current - 1, 1))}
                    disabled={isOutOfStock || quantity <= 1}
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-sm font-semibold text-[#2c241b]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#d8cbb9] bg-white text-lg font-semibold text-[#1f1912] disabled:opacity-50"
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

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={isOutOfStock}
                  className="rounded-2xl border border-[#d8cbb9] bg-white px-4 py-3 text-sm font-semibold text-[#1f1912] disabled:opacity-50"
                  onClick={() =>
                    addItem({
                      productId: product.id,
                      nombre: product.nombre,
                      precio: product.precio,
                      cantidad: quantity,
                      cantidadDisponible: product.cantidadDisponible,
                      categoria: product.categoria,
                      imagenUrl: product.imagenes[0]?.trim() || null,
                    })
                  }
                >
                  Agregar al carrito
                </button>
                <button
                  type="button"
                  disabled={isOutOfStock}
                  className="rounded-2xl bg-[#1f1912] px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_26px_rgba(31,25,18,0.16)] disabled:opacity-50"
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
          />
        </section>

        <FloatingWhatsAppButton phone={store?.telefono} />
      </main>

      <StoreCatalogFooter
        storeName={store?.nombre}
        slug={slug}
        phone={store?.telefono}
      />
    </>
  );
}

export function ProductDetailView({ slug, productId }: ProductDetailViewProps) {
  return (
    <StoreCartProvider slug={slug}>
      <ProductDetailContent slug={slug} productId={productId} />
    </StoreCartProvider>
  );
}
