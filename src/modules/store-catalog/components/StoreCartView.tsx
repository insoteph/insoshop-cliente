"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";

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

const lightCartTheme = {
  "--background": "#f5f6fb",
  "--background-soft": "#fbfcff",
  "--foreground": "#222743",
  "--foreground-strong": "#191d2d",
  "--panel": "rgba(255, 255, 255, 0.96)",
  "--panel-muted": "rgba(246, 248, 253, 0.96)",
  "--panel-strong": "rgba(255, 255, 255, 1)",
  "--line": "rgba(69, 85, 140, 0.12)",
  "--line-strong": "rgba(109, 56, 255, 0.22)",
  "--muted": "#66708c",
  "--accent": "#6d38ff",
  "--accent-strong": "#5a28eb",
  "--accent-soft": "rgba(109, 56, 255, 0.1)",
  "--success": "#21734d",
  "--success-soft": "rgba(33, 115, 77, 0.12)",
  "--danger": "#d04336",
  "--danger-soft": "rgba(208, 67, 54, 0.12)",
  "--warning": "#b67621",
  "--warning-soft": "rgba(182, 118, 33, 0.12)",
  "--shadow": "0 20px 44px rgba(33, 43, 79, 0.06)",
} as CSSProperties;

function StoreCartContent({ slug }: StoreCartViewProps) {
  const { items, subtotal, removeItem, setItemQuantity, clearCart } = useStoreCart();
  const [store, setStore] = useState<PublicStoreSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const timeoutId = window.setTimeout(async () => {
      try {
        const result = await fetchPublicStoreProducts({
          slug,
          page: 1,
          pageSize: 1,
        });

        if (active) {
          setStore(result.tienda);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "No se pudo cargar la informacion de la tienda.",
          );
        }
      }
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [slug]);

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
    <>
      <main
        className="min-h-screen bg-[#f5f6fb] px-4 py-8 md:px-8 lg:px-12"
        style={lightCartTheme}
      >
        <section className="mx-auto w-full max-w-7xl space-y-5">
          <header className="rounded-[28px] border border-[#e8ebf5] bg-white p-5 shadow-[0_16px_40px_rgba(32,40,84,0.06)] md:flex md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8b93af]">
                InsoShop
              </p>
              <h1 className="text-2xl font-bold text-[#191d2d]">Carrito</h1>
              <p className="text-sm text-[#66708c]">
                {store?.nombre ? `Pedido para ${store.nombre}` : `/${slug}`}
              </p>
            </div>

            <div className="mt-4 flex items-center gap-2 md:mt-0">
              <Link
                href={`/${encodeURIComponent(slug)}`}
                className="inline-flex rounded-2xl border border-[#e3e7f3] bg-[#f8f9fd] px-4 py-2.5 text-sm font-semibold text-[#202540]"
              >
                Seguir comprando
              </Link>
              {items.length > 0 ? (
                <button
                  type="button"
                  className="inline-flex rounded-2xl bg-[#d04336] px-4 py-2.5 text-sm font-semibold text-white"
                  onClick={clearCart}
                >
                  Vaciar carrito
                </button>
              ) : null}
            </div>
          </header>

          {error ? (
            <p className="rounded-2xl border border-[#f0c8c4] bg-[#fff1ef] px-4 py-3 text-sm text-[#9d3d34]">
              {error}
            </p>
          ) : null}

          {items.length === 0 ? (
            <div className="rounded-[28px] border border-[#e8ebf5] bg-white px-4 py-16 text-center shadow-[0_16px_40px_rgba(32,40,84,0.05)]">
              <p className="text-lg font-semibold text-[#202540]">
                Tu carrito esta vacio.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="space-y-3">
                {items.map((item) => (
                  <article
                    key={item.productId}
                    className="flex flex-col gap-3 rounded-[24px] border border-[#e8ebf5] bg-white p-4 shadow-[0_14px_30px_rgba(41,54,111,0.05)] sm:flex-row sm:items-center"
                  >
                    <div className="h-20 w-20 overflow-hidden rounded-2xl border border-[#eceef7] bg-[#f7f8fd]">
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
                      <p className="truncate text-base font-semibold text-[#191d2d]">
                        {item.nombre}
                      </p>
                      <p className="text-sm text-[#66708c]">{item.categoria}</p>
                      <p className="text-sm font-medium text-[#6d38ff]">
                        {formatCurrency(item.precio, store?.moneda ?? "HNL")}
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-2xl border border-[#e4e8f3] bg-[#f8f9fd] p-2">
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#e2e6f2] bg-white text-[#202540] disabled:opacity-50"
                        onClick={() => setItemQuantity(item.productId, item.cantidad - 1)}
                        disabled={item.cantidad <= 1}
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-[#202540]">
                        {item.cantidad}
                      </span>
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#e2e6f2] bg-white text-[#202540] disabled:opacity-50"
                        onClick={() => setItemQuantity(item.productId, item.cantidad + 1)}
                        disabled={item.cantidad >= item.cantidadDisponible}
                      >
                        +
                      </button>
                    </div>

                    <div className="space-y-2 text-right">
                      <p className="text-sm font-semibold text-[#202540]">
                        {formatCurrency(
                          item.precio * item.cantidad,
                          store?.moneda ?? "HNL",
                        )}
                      </p>
                      <button
                        type="button"
                        className="text-xs font-semibold text-[#d04336]"
                        onClick={() => removeItem(item.productId)}
                      >
                        Quitar
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              <aside className="h-fit space-y-4 rounded-[24px] border border-[#e8ebf5] bg-white p-5 shadow-[0_16px_40px_rgba(32,40,84,0.06)] lg:sticky lg:top-3">
                <h2 className="text-base font-semibold text-[#191d2d]">
                  Resumen del pedido
                </h2>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[#66708c]">Subtotal</span>
                    <span className="font-medium text-[#202540]">
                      {formatCurrency(subtotal, store?.moneda ?? "HNL")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-[#eceef7] pt-3">
                    <span className="font-semibold text-[#202540]">Total</span>
                    <span className="text-lg font-bold text-[#6d38ff]">
                      {formatCurrency(total, store?.moneda ?? "HNL")}
                    </span>
                  </div>
                </div>

                <a
                  href={checkoutHref ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex w-full items-center justify-center rounded-2xl bg-[#6d38ff] px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_26px_rgba(109,56,255,0.18)] ${
                    checkoutHref ? "" : "pointer-events-none opacity-50"
                  }`}
                >
                  Pagar por WhatsApp
                </a>
              </aside>
            </div>
          )}

          <FloatingWhatsAppButton phone={store?.telefono} />
        </section>
      </main>

      <StoreCatalogFooter
        storeName={store?.nombre}
        slug={slug}
        phone={store?.telefono}
      />
    </>
  );
}

export function StoreCartView({ slug }: StoreCartViewProps) {
  return (
    <StoreCartProvider slug={slug}>
      <StoreCartContent slug={slug} />
    </StoreCartProvider>
  );
}
