"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { formatCurrency } from "@/modules/core/lib/formatters";
import { StoreCatalogFooter } from "@/modules/store-catalog/components/StoreCatalogFooter";
import { FloatingWhatsAppButton } from "@/modules/store-catalog/components/FloatingWhatsAppButton";
import { storeCatalogThemeTokens } from "@/modules/store-catalog/lib/store-catalog-theme-tokens";
import { usePublicStoreLightMode } from "@/modules/store-catalog/lib/use-public-store-light-mode";
import {
  StoreCartProvider,
  useStoreCart,
} from "@/modules/store-catalog/providers/StoreCartProvider";
import { fetchPublicStoreProducts } from "@/modules/store-catalog/services/store-catalog-service";
import {
  createPublicClient,
  createPublicSale,
  fetchPublicPaymentMethods,
  type PublicPaymentMethod,
} from "@/modules/store-catalog/services/store-checkout-service";
import type { PublicStoreSummary } from "@/modules/store-catalog/types/store-catalog-types";

type StoreCartViewProps = {
  slug: string;
};

type CheckoutFormState = {
  nombreCompleto: string;
  telefono: string;
  metodoPagoId: number;
  tipoEntrega: "RecogerEnLocal" | "Domicilio";
  direccion: string;
  observacion: string;
};

const INITIAL_CHECKOUT_FORM: CheckoutFormState = {
  nombreCompleto: "",
  telefono: "",
  metodoPagoId: 0,
  tipoEntrega: "RecogerEnLocal",
  direccion: "",
  observacion: "",
};

function StoreCartContent({ slug }: StoreCartViewProps) {
  const { items, subtotal, removeItem, setItemQuantity, clearCart } = useStoreCart();
  const [store, setStore] = useState<PublicStoreSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutForm, setCheckoutForm] =
    useState<CheckoutFormState>(INITIAL_CHECKOUT_FORM);
  const [paymentMethods, setPaymentMethods] = useState<PublicPaymentMethod[]>([]);
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);

  usePublicStoreLightMode();

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

  useEffect(() => {
    if (!isCheckoutOpen) {
      return;
    }

    let active = true;
    setIsLoadingPaymentMethods(true);
    setCheckoutError(null);

    const timeoutId = window.setTimeout(async () => {
      try {
        const result = await fetchPublicPaymentMethods(slug);
        if (!active) {
          return;
        }

        setPaymentMethods(result);
        setCheckoutForm((current) => ({
          ...current,
          metodoPagoId: current.metodoPagoId || result[0]?.id || 0,
        }));
      } catch (loadError) {
        if (active) {
          setCheckoutError(
            loadError instanceof Error
              ? loadError.message
              : "No se pudieron cargar los metodos de pago.",
          );
        }
      } finally {
        if (active) {
          setIsLoadingPaymentMethods(false);
        }
      }
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [isCheckoutOpen, slug]);

  const total = useMemo(() => subtotal, [subtotal]);

  const proceedWhatsappHref = useMemo(() => {
    const digitsOnly = (store?.telefono ?? "").replace(/\D+/g, "");
    if (!digitsOnly) {
      return null;
    }

    const lines = [
      `Hola ${store?.nombre ?? ""}, confirme una compra desde el catalogo digital.`,
      `Cliente: ${checkoutForm.nombreCompleto.trim() || "Sin nombre"}`,
      `Telefono: ${checkoutForm.telefono.trim() || "Sin telefono"}`,
      `Entrega: ${
        checkoutForm.tipoEntrega === "Domicilio" ? "A domicilio" : "Recoger en local"
      }`,
      checkoutForm.tipoEntrega === "Domicilio" && checkoutForm.direccion.trim()
        ? `Direccion: ${checkoutForm.direccion.trim()}`
        : null,
      checkoutForm.observacion.trim()
        ? `Observacion: ${checkoutForm.observacion.trim()}`
        : null,
      ...items.map(
        (item) =>
          `- ${item.nombre} x${item.cantidad} = ${formatCurrency(
            item.precio * item.cantidad,
            store?.moneda ?? "HNL",
          )}`,
      ),
      `Total: ${formatCurrency(total, store?.moneda ?? "HNL")}`,
    ].filter(Boolean);

    return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(lines.join("\n"))}`;
  }, [
    checkoutForm.direccion,
    checkoutForm.nombreCompleto,
    checkoutForm.observacion,
    checkoutForm.telefono,
    checkoutForm.tipoEntrega,
    items,
    store?.moneda,
    store?.nombre,
    store?.telefono,
    total,
  ]);

  async function handleCheckoutSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCheckoutError(null);

    if (!store?.tiendaId) {
      setCheckoutError("No se pudo identificar la tienda para crear la venta.");
      return;
    }

    if (!checkoutForm.metodoPagoId) {
      setCheckoutError("Selecciona un metodo de pago para continuar.");
      return;
    }

    if (checkoutForm.tipoEntrega === "Domicilio" && !checkoutForm.direccion.trim()) {
      setCheckoutError("La direccion es obligatoria para entregas a domicilio.");
      return;
    }

    if (items.length === 0) {
      setCheckoutError("El carrito esta vacio.");
      return;
    }

    setIsSubmittingCheckout(true);

    try {
      const createdClient = await createPublicClient({
        nombreCompleto: checkoutForm.nombreCompleto.trim(),
        telefono: checkoutForm.telefono.trim(),
        tiendaId: store.tiendaId,
      });

      await createPublicSale({
        tiendaId: store.tiendaId,
        metodoPagoId: checkoutForm.metodoPagoId,
        estadoVentaId: 1,
        clienteId: createdClient.id,
        tipoEntrega: checkoutForm.tipoEntrega,
        direccion:
          checkoutForm.tipoEntrega === "Domicilio"
            ? checkoutForm.direccion.trim()
            : "",
        observacion: checkoutForm.observacion.trim(),
        detalles: items.map((item) => ({
          productoId: item.productId,
          cantidad: item.cantidad,
        })),
      });

      if (proceedWhatsappHref) {
        window.open(proceedWhatsappHref, "_blank", "noopener,noreferrer");
      }

      clearCart();
      setCheckoutForm(INITIAL_CHECKOUT_FORM);
      setIsCheckoutOpen(false);
    } catch (submitError) {
      setCheckoutError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudo registrar la compra.",
      );
    } finally {
      setIsSubmittingCheckout(false);
    }
  }

  return (
    <div className="bg-[var(--background)]" style={storeCatalogThemeTokens.light}>
      <main className="min-h-screen bg-[var(--background)] px-4 py-8 md:px-8 lg:px-12">
        <section className="mx-auto w-full max-w-7xl space-y-5">
          <header className="rounded-[28px] border border-[var(--line)] bg-[var(--panel-strong)] p-5 shadow-[var(--shadow)] md:flex md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                InsoShop
              </p>
              <h1 className="text-2xl font-bold text-[var(--foreground-strong)]">
                Carrito
              </h1>
              <p className="text-sm text-[var(--muted)]">
                {store?.nombre ? `Pedido para ${store.nombre}` : `/${slug}`}
              </p>
            </div>

            <div className="mt-4 flex items-center gap-2 md:mt-0">
              <Link
                href={`/${encodeURIComponent(slug)}`}
                className="inline-flex rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)]"
              >
                Seguir comprando
              </Link>
              {items.length > 0 ? (
                <button
                  type="button"
                  className="inline-flex rounded-2xl bg-[var(--danger)] px-4 py-2.5 text-sm font-semibold text-white"
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
            <div className="rounded-[28px] border border-[var(--line)] bg-[var(--panel-strong)] px-4 py-16 text-center shadow-[var(--shadow)]">
              <p className="text-lg font-semibold text-[var(--foreground)]">
                Tu carrito esta vacio.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-3">
                {items.map((item) => (
                  <article
                    key={item.productId}
                    className="flex flex-col gap-3 rounded-[24px] border border-[var(--line)] bg-[var(--panel-strong)] p-4 shadow-[var(--shadow)] sm:flex-row sm:items-center"
                  >
                    <div className="h-20 w-20 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)]">
                      {item.imagenUrl?.trim() ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.imagenUrl.trim()}
                          alt={item.nombre}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                          NO IMAGE
                        </div>
                      )}
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

                    <div className="inline-flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] p-2">
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--panel-strong)] text-[var(--foreground)] disabled:opacity-50"
                        onClick={() => setItemQuantity(item.productId, item.cantidad - 1)}
                        disabled={item.cantidad <= 1}
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-[var(--foreground)]">
                        {item.cantidad}
                      </span>
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--panel-strong)] text-[var(--foreground)] disabled:opacity-50"
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

              <aside className="h-fit space-y-4 rounded-[24px] border border-[var(--line)] bg-[var(--panel-strong)] p-5 shadow-[var(--shadow)] lg:sticky lg:top-3">
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
                  <div className="flex items-center justify-between border-t border-[var(--line)] pt-3">
                    <span className="font-semibold text-[var(--foreground)]">Total</span>
                    <span className="text-lg font-bold text-[var(--accent)]">
                      {formatCurrency(total, store?.moneda ?? "HNL")}
                    </span>
                  </div>
                </div>

                {!isCheckoutOpen ? (
                  <button
                    type="button"
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white shadow-[var(--shadow)]"
                    onClick={() => setIsCheckoutOpen(true)}
                  >
                    Proceder con la compra
                  </button>
                ) : (
                  <form
                    className="space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] p-4"
                    onSubmit={handleCheckoutSubmit}
                  >
                    <h3 className="text-sm font-semibold text-[var(--foreground-strong)]">
                      Datos de compra
                    </h3>

                    <input
                      required
                      value={checkoutForm.nombreCompleto}
                      onChange={(event) =>
                        setCheckoutForm((current) => ({
                          ...current,
                          nombreCompleto: event.target.value,
                        }))
                      }
                      placeholder="Nombre completo"
                      className="app-input w-full rounded-xl px-3 py-2.5 text-sm"
                    />

                    <input
                      required
                      value={checkoutForm.telefono}
                      onChange={(event) =>
                        setCheckoutForm((current) => ({
                          ...current,
                          telefono: event.target.value,
                        }))
                      }
                      placeholder="Telefono"
                      className="app-input w-full rounded-xl px-3 py-2.5 text-sm"
                    />

                    <select
                      required
                      value={checkoutForm.metodoPagoId || ""}
                      onChange={(event) =>
                        setCheckoutForm((current) => ({
                          ...current,
                          metodoPagoId: Number(event.target.value),
                        }))
                      }
                      disabled={isLoadingPaymentMethods}
                      className="app-input w-full rounded-xl px-3 py-2.5 text-sm"
                    >
                      <option value="">
                        {isLoadingPaymentMethods
                          ? "Cargando metodos de pago..."
                          : "Selecciona metodo de pago"}
                      </option>
                      {paymentMethods.map((method) => (
                        <option key={method.id} value={method.id}>
                          {method.nombre}
                        </option>
                      ))}
                    </select>

                    <select
                      value={checkoutForm.tipoEntrega}
                      onChange={(event) =>
                        setCheckoutForm((current) => ({
                          ...current,
                          tipoEntrega: event.target.value as
                            | "RecogerEnLocal"
                            | "Domicilio",
                        }))
                      }
                      className="app-input w-full rounded-xl px-3 py-2.5 text-sm"
                    >
                      <option value="RecogerEnLocal">Recoger en local</option>
                      <option value="Domicilio">A domicilio</option>
                    </select>

                    <input
                      value={checkoutForm.direccion}
                      onChange={(event) =>
                        setCheckoutForm((current) => ({
                          ...current,
                          direccion: event.target.value,
                        }))
                      }
                      placeholder="Direccion"
                      disabled={checkoutForm.tipoEntrega !== "Domicilio"}
                      className="app-input w-full rounded-xl px-3 py-2.5 text-sm disabled:opacity-60"
                    />

                    <textarea
                      value={checkoutForm.observacion}
                      onChange={(event) =>
                        setCheckoutForm((current) => ({
                          ...current,
                          observacion: event.target.value,
                        }))
                      }
                      placeholder="Observacion (opcional)"
                      rows={3}
                      className="app-input w-full rounded-xl px-3 py-2.5 text-sm"
                    />

                    {checkoutError ? (
                      <p className="app-alert-error rounded-xl px-3 py-2 text-xs">
                        {checkoutError}
                      </p>
                    ) : null}

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        className="app-button-secondary rounded-xl px-3 py-2.5 text-xs font-semibold"
                        onClick={() => {
                          setIsCheckoutOpen(false);
                          setCheckoutError(null);
                        }}
                        disabled={isSubmittingCheckout}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="app-button-primary rounded-xl px-3 py-2.5 text-xs font-semibold disabled:opacity-60"
                        disabled={isSubmittingCheckout}
                      >
                        {isSubmittingCheckout
                          ? "Guardando..."
                          : "Proceder por WhatsApp"}
                      </button>
                    </div>
                  </form>
                )}
              </aside>
            </div>
          )}

          <FloatingWhatsAppButton phone={store?.telefono} />
        </section>
      </main>

      <StoreCatalogFooter storeName={store?.nombre} phone={store?.telefono} />
    </div>
  );
}

export function StoreCartView({ slug }: StoreCartViewProps) {
  return (
    <StoreCartProvider slug={slug}>
      <StoreCartContent slug={slug} />
    </StoreCartProvider>
  );
}
