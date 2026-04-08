"use client";

import Link from "next/link";
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
      <main className="min-h-screen px-4 py-8 md:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="app-card data-table-skeleton h-[560px] rounded-3xl" />
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen px-4 py-8 md:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl space-y-4">
          <Link
            href={`/${encodeURIComponent(slug)}`}
            className="inline-flex rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-[var(--foreground)]"
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
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 md:px-8 lg:px-12">
      <section className="mx-auto w-full max-w-7xl space-y-5">
        <header className="app-card flex items-center justify-between gap-3 rounded-2xl px-4 py-3">
          <Link
            href={`/${encodeURIComponent(slug)}`}
            className="app-button-secondary rounded-xl px-3 py-2 text-sm font-medium"
          >
            Volver al catalogo
          </Link>

          <StoreCartButton slug={slug} totalItems={totalItems} />
        </header>

        <div className="app-card grid gap-6 rounded-3xl p-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <ProductImageGallery
            productName={product.nombre}
            imageUrls={product.imagenes}
          />

          <div className="space-y-4">
            <span className="app-badge-neutral w-fit rounded-full px-3 py-1 text-xs font-semibold">
              {product.categoria}
            </span>
            <h1 className="text-3xl font-bold text-[var(--foreground-strong)]">
              {product.nombre}
            </h1>
            <p className="text-sm leading-relaxed text-[var(--muted)]">
              {product.descripcion}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <p className="text-3xl font-bold text-[var(--accent)]">
                {formatCurrency(product.precio, currency)}
              </p>

              {product.cantidadDisponible > 0 ? (
                <span className="app-badge-success rounded-full px-3 py-1 text-xs font-semibold">
                  Disponible ({product.cantidadDisponible})
                </span>
              ) : (
                <span className="app-badge-danger rounded-full px-3 py-1 text-xs font-semibold">
                  Agotado
                </span>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-[var(--foreground)]">Cantidad</p>
              <div className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--panel-muted)] p-2">
                <button
                  type="button"
                  className="app-button-secondary h-9 w-9 rounded-lg text-lg"
                  onClick={() => setQuantity((current) => Math.max(current - 1, 1))}
                  disabled={isOutOfStock || quantity <= 1}
                >
                  -
                </button>
                <span className="w-12 text-center text-sm font-semibold text-[var(--foreground)]">
                  {quantity}
                </span>
                <button
                  type="button"
                  className="app-button-secondary h-9 w-9 rounded-lg text-lg"
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
                className="app-button-secondary rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-50"
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
                className="app-button-primary rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-50"
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

        <StoreCatalogFooter />
      </section>

      <FloatingWhatsAppButton phone={store?.telefono} />
    </main>
  );
}

export function ProductDetailView({ slug, productId }: ProductDetailViewProps) {
  return (
    <StoreCartProvider slug={slug}>
      <ProductDetailContent slug={slug} productId={productId} />
    </StoreCartProvider>
  );
}
