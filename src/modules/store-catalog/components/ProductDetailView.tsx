"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { formatCurrency } from "@/modules/core/lib/formatters";
import { ProductImageGallery } from "@/modules/store-catalog/components/ProductImageGallery";
import {
  fetchPublicStoreProductById,
  fetchPublicStoreProducts,
} from "@/modules/store-catalog/services/store-catalog-service";
import type { PublicStoreProduct } from "@/modules/store-catalog/types/store-catalog-types";

type ProductDetailViewProps = {
  slug: string;
  productId: number;
};

export function ProductDetailView({ slug, productId }: ProductDetailViewProps) {
  const [product, setProduct] = useState<PublicStoreProduct | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [currency, setCurrency] = useState("HNL");

  const loadProduct = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [productResult, catalogResult] = await Promise.all([
        fetchPublicStoreProductById(slug, productId),
        fetchPublicStoreProducts({ slug, page: 1, pageSize: 1 }),
      ]);
      setProduct(productResult);
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
      <section className="mx-auto w-full max-w-6xl space-y-5">
        <Link
          href={`/${encodeURIComponent(slug)}`}
          className="inline-flex rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--foreground)]"
        >
          Volver al catalogo
        </Link>

        <div className="grid gap-6 rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-5 shadow-[var(--shadow)] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <ProductImageGallery
            productName={product.nombre}
            imageUrls={product.imagenes}
          />

          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              {product.categoria}
            </p>
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
                onClick={() => setNote("Carrito en construccion. Esta accion quedo provisional.")}
              >
                Agregar al carrito
              </button>
              <button
                type="button"
                disabled={isOutOfStock}
                className="app-button-primary rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-50"
                onClick={() =>
                  setNote("Compra directa en construccion. Esta accion quedo provisional.")
                }
              >
                Comprar ahora
              </button>
            </div>

            {note ? (
              <p className="app-alert-warning rounded-2xl px-4 py-3 text-sm">
                {note}
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
