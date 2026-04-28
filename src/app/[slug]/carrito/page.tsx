"use client";

import { useParams } from "next/navigation";

import { StoreCartView } from "@/modules/store-catalog/components/StoreCartView";

export default function StoreCartPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug?.trim();

  if (!slug) {
    return (
      <main className="min-h-screen px-4 py-8 md:px-8 lg:px-12">
        <p className="app-alert-error mx-auto w-full max-w-3xl rounded-2xl px-4 py-3 text-sm">
          La ruta del carrito no es valida.
        </p>
      </main>
    );
  }

  return <StoreCartView slug={slug} />;
}
