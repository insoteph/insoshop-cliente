"use client";

import { useEffect, useMemo, useState } from "react";

import { fetchPublicStore, createSale, type PublicStore } from "@/modules/sales/services/sale-service";
import { useCart } from "@/modules/public-store/hooks/useCart";

type PublicStoreViewProps = {
  slug: string;
};

const publicPaymentMethodId = Number(
  process.env.NEXT_PUBLIC_PUBLIC_SALE_PAYMENT_METHOD_ID || 0
);
const publicSaleStatusId = Number(
  process.env.NEXT_PUBLIC_PUBLIC_SALE_STATUS_ID || 0
);

export function PublicStoreView({ slug }: PublicStoreViewProps) {
  const [store, setStore] = useState<PublicStore | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const cart = useCart(slug);

  useEffect(() => {
    fetchPublicStore(slug)
      .then(setStore)
      .catch((error) => {
        setFeedback(
          error instanceof Error
            ? error.message
            : "No se pudo cargar la tienda pública."
        );
      });
  }, [slug]);

  const whatsappUrl = useMemo(() => {
    if (!store) {
      return null;
    }

    const phone = store.telefono.replace(/\D/g, "");
    const lines = cart.items.map(
      (item) =>
        `- ${item.nombre} x${item.cantidad} = ${(item.precio * item.cantidad).toFixed(2)}`
    );
    const message = [
      `Hola, quiero comprar en ${store.nombre}.`,
      ...lines,
      `Total: ${cart.total.toFixed(2)} ${store.moneda}`,
    ].join("\n");

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }, [cart.items, cart.total, store]);

  async function handleCheckout() {
    if (!store) {
      return;
    }

    if (!cart.items.length) {
      setFeedback("Agrega productos al carrito antes de comprar.");
      return;
    }

    if (!publicPaymentMethodId || !publicSaleStatusId) {
      setFeedback(
        "Configura NEXT_PUBLIC_PUBLIC_SALE_PAYMENT_METHOD_ID y NEXT_PUBLIC_PUBLIC_SALE_STATUS_ID."
      );
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      await createSale({
        tiendaId: store.tiendaId,
        metodoPagoId: publicPaymentMethodId,
        estadoVentaId: publicSaleStatusId,
        observacion: "Pedido generado desde tienda pública",
        detalles: cart.items.map((item) => ({
          productoId: item.id,
          cantidad: item.cantidad,
        })),
      });

      if (whatsappUrl) {
        window.location.href = whatsappUrl;
      }

      cart.clear();
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "No se pudo registrar la compra."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!store) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10">
        <div className="panel-card">
          <p className="text-sm text-[var(--muted)]">
            {feedback || "Cargando tienda..."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-10 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <section className="space-y-6">
        <div className="panel-card">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            Tienda pública
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-[var(--foreground)]">
            {store.nombre}
          </h1>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Catálogo público multi-tenant filtrado por el slug de la tienda.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {store.productos.map((product) => (
            <article key={product.id} className="panel-card p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.imagenes[0] || "/assets/bg-img.jpg"}
                alt={product.nombre}
                className="h-52 w-full rounded-2xl object-cover"
              />
              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                {product.categoria}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-[var(--foreground)]">
                {product.nombre}
              </h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                {product.descripcion}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <strong className="text-xl text-[var(--foreground)]">
                  {product.precio.toFixed(2)}
                </strong>
                <button
                  type="button"
                  className="rounded-2xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
                  onClick={() =>
                    cart.addItem({
                      id: product.id,
                      nombre: product.nombre,
                      precio: product.precio,
                    })
                  }
                >
                  Agregar
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="panel-card h-fit space-y-4">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          Carrito
        </p>
        <div className="space-y-3">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-[var(--foreground)]">
                    {item.nombre}
                  </p>
                  <p className="text-sm text-[var(--muted)]">
                    {item.precio.toFixed(2)} {store.moneda}
                  </p>
                </div>
                <input
                  type="number"
                  min="0"
                  value={item.cantidad}
                  onChange={(event) =>
                    cart.updateQuantity(item.id, Number(event.target.value))
                  }
                  className="field-shell w-20 rounded-xl px-3 py-2 text-sm outline-none"
                />
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-4">
          <p className="text-sm text-[var(--muted)]">Total</p>
          <strong className="mt-1 block text-3xl text-[var(--foreground)]">
            {cart.total.toFixed(2)} {store.moneda}
          </strong>
        </div>
        <button
          type="button"
          className="w-full rounded-2xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
          onClick={handleCheckout}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Procesando..." : "Comprar por WhatsApp"}
        </button>
        {feedback ? <p className="text-sm text-[var(--muted)]">{feedback}</p> : null}
      </aside>
    </main>
  );
}
