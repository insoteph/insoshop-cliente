"use client";

import Link from "next/link";

import { StoreCartProvider } from "@/modules/store-catalog/providers/StoreCartProvider";
import { ProductDetailPage } from "@/modules/store-catalog/components/ProductDetailPage";
import {
  useProductDetailView,
  type ProductDetailViewModel,
} from "@/modules/store-catalog/hooks/useProductDetailView";
import { storeCatalogThemeTokens } from "@/modules/store-catalog/lib/store-catalog-theme-tokens";

type ProductDetailViewProps = {
  slug: string;
  productId: number;
};

function ProductDetailContent({ slug, productId }: ProductDetailViewProps) {
  const detail = useProductDetailView({ slug, productId });

  if (detail.isLoading) {
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

  if (detail.error || !detail.product) {
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
            {detail.error ?? "No se encontro el producto solicitado."}
          </p>
        </div>
      </main>
    );
  }

  const { ...pageModel } = detail;

  return (
    <ProductDetailPage
      {...(pageModel as Omit<ProductDetailViewModel, "product"> & {
        product: NonNullable<ProductDetailViewModel["product"]>;
      })}
    />
  );
}

export function ProductDetailView({ slug, productId }: ProductDetailViewProps) {
  return (
    <StoreCartProvider slug={slug}>
      <ProductDetailContent slug={slug} productId={productId} />
    </StoreCartProvider>
  );
}
