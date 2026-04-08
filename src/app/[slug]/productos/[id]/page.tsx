"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";

import { ProductDetailView } from "@/modules/store-catalog/components/ProductDetailView";

export default function StoreProductDetailPage() {
  const params = useParams<{ slug: string; id: string }>();

  const slug = params.slug?.trim() ?? "";
  const productId = useMemo(() => Number(params.id), [params.id]);

  if (!slug || !Number.isInteger(productId) || productId <= 0) {
    return (
      <main className="min-h-screen px-4 py-8 md:px-8 lg:px-12">
        <p className="app-alert-error mx-auto w-full max-w-3xl rounded-2xl px-4 py-3 text-sm">
          El producto solicitado no es valido.
        </p>
      </main>
    );
  }

  return <ProductDetailView slug={slug} productId={productId} />;
}
