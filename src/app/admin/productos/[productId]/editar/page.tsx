"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";

import { ProductEditorView } from "@/modules/products/components/ProductEditorView";

export default function EditProductPage() {
  const params = useParams<{ productId: string }>();

  const productId = useMemo(
    () => Number(params.productId),
    [params.productId],
  );

  if (!Number.isInteger(productId) || productId <= 0) {
    return (
      <main className="min-h-screen px-4 py-8 md:px-8 lg:px-12">
        <p className="app-alert-error mx-auto w-full max-w-3xl rounded-2xl px-4 py-3 text-sm">
          El producto solicitado no es valido.
        </p>
      </main>
    );
  }

  return <ProductEditorView mode="edit" productId={productId} />;
}

