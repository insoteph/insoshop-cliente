"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { formatCurrency } from "@/modules/core/lib/formatters";
import { StoreCatalogFooter } from "@/modules/store-catalog/components/StoreCatalogFooter";
import { FloatingWhatsAppButton } from "@/modules/store-catalog/components/FloatingWhatsAppButton";
import {
  StoreCartProvider,
  useStoreCart,
} from "@/modules/store-catalog/providers/StoreCartProvider";
import { fetchPublicStoreProducts } from "@/modules/store-catalog/services/store-catalog-service";
import type { PublicStoreSummary } from "@/modules/store-catalog/types/store-catalog-types";

type StoreCartViewProps = {
  slug: string;
};

function StoreCartContent({ slug }: StoreCartViewProps) {
  const { items, subtotal, removeItem, setItemQuantity, clearCart } = useStoreCart();
  const [store, setStore] = useState<PublicStoreSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadStoreSummary = useCallback(async () => {
    try {
      const result = await fetchPublicStoreProducts({
        slug,
        page: 1,
        pageSize: 1,
      });
      setStore(result.tienda);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudo cargar la informacion de la tienda.",
      );
    }
  }, [slug]);

  useEffect(() => {
    void loadStoreSummary();
  }, [loadStoreSummary]);

  const total = useMemo(() => subtotal, [subtotal]);

  const checkoutHref = useMemo(() => {
    const digitsOnly = (store?.telefono ?? "").replace(/\D+/g, "");

    if (!digitsOnly || items.length === 0) {
      return null;
    }

    const lines = [
      `Hola ${store?.nombre ?? ""}, deseo realizar este pedido:`,
      ...items.map(
        (item) =>
          `- ${item.nombre} x${item.cantidad} = ${formatCurrency(
            item.precio * item.cantidad,
            store?.moneda ?? "HNL",
          )}`,
      ),
      `Total: ${formatCurrency(total, store?.moneda ?? "HNL")}`,
    ];

    return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(lines.join("\n"))}`;
  }, [items, store?.moneda, store?.nombre, store?.telefono, total]);

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 md:px-8 lg:px-12">
      <section className="mx-auto w-full max-w-7xl space-y-5">
        <header className="app-card flex flex-col gap-3 rounded-3xl p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              Insoshop
            </p>
            <h1 className="text-2xl font-bold text-[var(--foreground-strong)]">Carrito</h1>
            <p className="text-sm text-[var(--muted)]">
              {store?.nombre ? `Pedido para ${store.nombre}` : `/${slug}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/${encodeURIComponent(slug)}`}
              className="app-button-secondary rounded-xl px-4 py-2 text-sm font-medium"
            >
              Seguir comprando
            </Link>
            {items.length > 0 ? (
              <button
                type="button"
                className="app-button-danger rounded-xl px-4 py-2 text-sm font-medium"
                onClick={clearCart}
              >
                Vaciar carrito
              </button>
            ) : null}
          </div>
        </header>

        {error ? (
          <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">{error}</p>
        ) : null}

        {items.length === 0 ? (
          <div className="app-card rounded-3xl px-4 py-14 text-center">
            <p className="text-lg font-semibold text-[var(--foreground)]">
              Tu carrito esta vacio.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-3">
              {items.map((item) => (
                <article
                  key={item.productId}
                  className="app-card flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center"
                >
                  <div className="h-20 w-20 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel-muted)]">
                    {item.imagenUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imagenUrl}
                        alt={item.nombre}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="truncate text-base font-semibold text-[var(--foreground-strong)]">
                      {item.nombre}
                    </p>
                    <p className="text-sm text-[var(--muted)]">{item.categoria}</p>
                    <p className="text-sm font-medium text-[var(--accent)]">
                      {formatCurrency(item.precio, store?.moneda ?? "HNL")}
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--panel-muted)] p-2">
                    <button
                      type="button"
                      className="app-button-secondary h-8 w-8 rounded-lg"
                      onClick={() => setItemQuantity(item.productId, item.cantidad - 1)}
                      disabled={item.cantidad <= 1}
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.cantidad}</span>
                    <button
                      type="button"
                      className="app-button-secondary h-8 w-8 rounded-lg"
                      onClick={() => setItemQuantity(item.productId, item.cantidad + 1)}
                      disabled={item.cantidad >= item.cantidadDisponible}
                    >
                      +
                    </button>
                  </div>

                  <div className="space-y-2 text-right">
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {formatCurrency(
                        item.precio * item.cantidad,
                        store?.moneda ?? "HNL",
                      )}
                    </p>
                    <button
                      type="button"
                      className="text-xs font-semibold text-[var(--danger)]"
                      onClick={() => removeItem(item.productId)}
                    >
                      Quitar
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <aside className="app-card h-fit space-y-3 rounded-2xl p-4 lg:sticky lg:top-3">
              <h2 className="text-base font-semibold text-[var(--foreground-strong)]">
                Resumen del pedido
              </h2>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--muted)]">Subtotal</span>
                  <span className="font-medium text-[var(--foreground)]">
                    {formatCurrency(subtotal, store?.moneda ?? "HNL")}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-[var(--line)] pt-2">
                  <span className="font-semibold text-[var(--foreground)]">Total</span>
                  <span className="text-lg font-bold text-[var(--accent)]">
                    {formatCurrency(total, store?.moneda ?? "HNL")}
                  </span>
                </div>
              </div>

              <a
                href={checkoutHref ?? "#"}
                target="_blank"
                rel="noreferrer"
                className={`app-button-primary inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold ${
                  checkoutHref ? "" : "pointer-events-none opacity-50"
                }`}
              >
                Pagar por WhatsApp
              </a>
            </aside>
          </div>
        )}

        <StoreCatalogFooter />
      </section>

      <FloatingWhatsAppButton phone={store?.telefono} />
    </main>
  );
}

export function StoreCartView({ slug }: StoreCartViewProps) {
  return (
    <StoreCartProvider slug={slug}>
      <StoreCartContent slug={slug} />
    </StoreCartProvider>
  );
}
