"use client";

import { useParams } from "next/navigation";

import { StoreCatalogView } from "@/modules/store-catalog/components/StoreCatalogView";

export default function SlugPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug?.trim();

  if (!slug) {
    return (
      <main className="min-h-screen px-4 py-8 md:px-8 lg:px-12">
        <p className="app-alert-error mx-auto w-full max-w-3xl rounded-2xl px-4 py-3 text-sm">
          La ruta de catalogo no es valida.
        </p>
      </main>
    );
  }

  return <StoreCatalogView slug={slug} />;
}
