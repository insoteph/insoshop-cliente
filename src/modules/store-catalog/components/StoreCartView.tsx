"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { formatCurrency } from "@/modules/core/lib/formatters";
import { StoreCatalogFooter } from "@/modules/store-catalog/components/StoreCatalogFooter";
import { FloatingWhatsAppButton } from "@/modules/store-catalog/components/FloatingWhatsAppButton";
import { storeCatalogThemeTokens } from "@/modules/store-catalog/lib/store-catalog-theme-tokens";
import { usePublicStoreLightMode } from "@/modules/store-catalog/lib/use-public-store-light-mode";
import { useConfirmationDialog } from "@/modules/core/providers/ConfirmationDialogProvider";
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
  const { items, subtotal, removeItem, setItemQuantity, clearCart } =
    useStoreCart();
  const { confirm } = useConfirmationDialog();
  const [store, setStore] = useState<PublicStoreSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState<CheckoutFormState>(
    INITIAL_CHECKOUT_FORM,
  );
  const [paymentMethods, setPaymentMethods] = useState<PublicPaymentMethod[]>(
    [],
  );
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

    if (
      checkoutForm.tipoEntrega === "Domicilio" &&
      !checkoutForm.direccion.trim()
    ) {
      setCheckoutError(
        "La direccion es obligatoria para entregas a domicilio.",
      );
      return;
    }

    if (items.length === 0) {
      setCheckoutError("El carrito esta vacio.");
      return;
    }

    setIsSubmittingCheckout(true);

    try {
      // 1. Crear cliente
      const createdClient = await createPublicClient({
        nombreCompleto: checkoutForm.nombreCompleto.trim(),
        telefono: checkoutForm.telefono.trim(),
        tiendaId: store.tiendaId,
      });

      // 2. Crear venta y capturar respuesta
      const saleResponse = await createPublicSale({
        tiendaId: store.tiendaId,
        metodoPagoId: checkoutForm.metodoPagoId,
        clienteId: createdClient.id,
        tipoEntrega: checkoutForm.tipoEntrega,
        direccion:
          checkoutForm.tipoEntrega === "Domicilio"
            ? checkoutForm.direccion.trim()
            : "",
        observacion: checkoutForm.observacion.trim(),
        detalles: items.map((item) => ({
          productoVarianteId: item.productoVarianteId,
          cantidad: item.cantidad,
        })),
      });

      // 3. Obtener numero de orden
      const numeroOrden = saleResponse?.numeroOrden ?? "N/A";

      // 4. Construir mensaje de WhatsApp dinámicamente
      const digitsOnly = (store?.telefono ?? "").replace(/\D+/g, "");

      if (digitsOnly) {
        const lines = [
          `Hola ${store?.nombre ?? ""} 👋`,
          `Quisiera realizar la siguiente compra desde el catálogo digital:`,
          ``,
          `━━━━━━━━━━━━━━━━━━`,
          `🧾 *DETALLE DE LA ORDEN*`,
          `━━━━━━━━━━━━━━━━━━`,
          `Número de orden: ${numeroOrden}`,
          ``,
          `👤 *CLIENTE*`,
          `${checkoutForm.nombreCompleto.trim() || "Sin nombre"}`,
          `Teléfono: ${checkoutForm.telefono.trim() || "Sin telefono"}`,
          ``,
          `🚚 *TIPO DE ENTREGA*`,
          `${
            checkoutForm.tipoEntrega === "Domicilio"
              ? "A domicilio"
              : "Recoger en local"
          }`,
          checkoutForm.tipoEntrega === "Domicilio" &&
          checkoutForm.direccion.trim()
            ? `📍 Dirección:\n${checkoutForm.direccion.trim()}`
            : null,
          ``,
          `🛒 *PRODUCTOS*`,
          `━━━━━━━━━━━━━━━━━━`,
          ...items.map(
            (item) =>
              `• ${item.nombre}${
                item.varianteResumen ? ` (${item.varianteResumen})` : ""
              }\n  Cantidad: ${item.cantidad} | Subtotal: ${formatCurrency(
                item.precio * item.cantidad,
                store?.moneda ?? "HNL",
              )}`,
          ),
          `━━━━━━━━━━━━━━━━━━`,
          ``,
          `💰 *TOTAL A PAGAR*`,
          `${formatCurrency(total, store?.moneda ?? "HNL")}`,
          ``,
          `━━━━━━━━━━━━━━━━━━`,
          `Gracias por tu compra 🤝`,
          `Un encargado estará confirmando y procesando tu pedido en breve.`,
          `Agradecemos tu preferencia en ${store?.nombre ?? ""}.`,
        ].filter(Boolean);

        const message = lines.join("\n");
        const whatsappUrl = `https://wa.me/${digitsOnly}?text=${encodeURIComponent(message)}`;

        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      }

      // 5. Limpiar estado
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
    <div
      className="bg-[var(--background)]"
      style={storeCatalogThemeTokens.light}
    >
      <main className="min-h-screen bg-[var(--background)] py-0">
        <header className="overflow-hidden rounded-b-[32px] border border-transparent bg-[linear-gradient(135deg,#2563EB_0%,#1D4ED8_60%,#1E3A8A_100%)] shadow-[0_20px_50px_rgba(37,99,235,0.18)] lg:rounded-none">
          <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-3 px-4 py-4 sm:px-5 lg:px-6">
            <Link
              href={`/${encodeURIComponent(slug)}`}
              className="inline-flex rounded-full border border-white/25 bg-white/15 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(15,23,42,0.12)] backdrop-blur-sm transition hover:bg-white/20"
            >
              Seguir comprando
            </Link>

            {items.length > 0 ? (
              <button
                type="button"
                className="inline-flex rounded-full border border-white/25 bg-white px-4 py-2.5 text-sm font-semibold text-[#DC2626] shadow-[0_10px_24px_rgba(15,23,42,0.12)] transition hover:bg-[#FEF2F2]"
                onClick={async () => {
                  const shouldContinue = await confirm({
                    title: "Vaciar carrito",
                    description:
                      "Esta accion eliminara todos los productos del carrito. Deseas continuar?",
                    confirmLabel: "Vaciar",
                    cancelLabel: "Cancelar",
                    variant: "danger",
                  });

                  if (!shouldContinue) {
                    return;
                  }

                  clearCart({ notify: true, feedbackType: "cancel" });
                }}
              >
                Vaciar carrito
              </button>
            ) : (
              <span className="inline-flex" />
            )}
          </div>
        </header>

        <section className="mx-auto w-full max-w-[1440px] space-y-5 px-4 pt-5 sm:px-6 lg:px-8">

          {error ? (
            <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
              {error}
            </p>
          ) : null}

          {items.length === 0 ? (
            <div className="rounded-[32px] border border-[#dbe7ff] bg-white px-4 py-16 text-center shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
              <p className="text-lg font-semibold text-[var(--foreground)]">
                Tu carrito esta vacio.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-3">
                {items.map((item) => (
                  <article
                    key={item.productoVarianteId}
                    className="rounded-[28px] border border-[#dbe7ff] bg-white p-4 shadow-[0_16px_36px_rgba(15,23,42,0.06)]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex min-w-0 flex-1 gap-3">
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-[#dbe7ff] bg-[#F8FBFF]">
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
                          <p className="text-sm text-[#64748B]">
                            {item.categoria}
                          </p>
                          {item.varianteResumen ? (
                            <p className="text-xs font-medium text-[#64748B]">
                              {item.varianteResumen}
                            </p>
                          ) : null}
                          <p className="text-sm font-medium text-[#2563EB]">
                            {formatCurrency(item.precio, store?.moneda ?? "HNL")}
                          </p>
                        </div>
                      </div>

                      <div className="flex h-full shrink-0 items-center">
                        <div className="flex h-[8.75rem] w-[3.25rem] flex-col items-center justify-between rounded-[20px] border border-[#dbe7ff] bg-[#F8FBFF] p-1.5">
                          <button
                            type="button"
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-[var(--foreground)] disabled:opacity-50"
                            onClick={() =>
                              setItemQuantity(
                                item.productoVarianteId,
                                item.cantidad - 1,
                              )
                            }
                            disabled={item.cantidad <= 1}
                          >
                            <span
                              aria-hidden="true"
                              className="h-5 w-5 text-[#2563EB]"
                              style={{
                                WebkitMaskImage: "url(/icons/minus-circle.svg)",
                                maskImage: "url(/icons/minus-circle.svg)",
                                WebkitMaskRepeat: "no-repeat",
                                maskRepeat: "no-repeat",
                                WebkitMaskPosition: "center",
                                maskPosition: "center",
                                WebkitMaskSize: "contain",
                                maskSize: "contain",
                                backgroundColor: "currentColor",
                              }}
                            />
                          </button>
                          <span className="w-full text-center text-sm font-semibold text-[var(--foreground)]">
                            {item.cantidad}
                          </span>
                          <button
                            type="button"
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-[var(--foreground)] disabled:opacity-50"
                            onClick={() =>
                              setItemQuantity(
                                item.productoVarianteId,
                                item.cantidad + 1,
                              )
                            }
                            disabled={item.cantidad >= item.cantidadDisponible}
                          >
                            <span
                              aria-hidden="true"
                              className="h-5 w-5 text-[#2563EB]"
                              style={{
                                WebkitMaskImage: "url(/icons/plus-circle.svg)",
                                maskImage: "url(/icons/plus-circle.svg)",
                                WebkitMaskRepeat: "no-repeat",
                                maskRepeat: "no-repeat",
                                WebkitMaskPosition: "center",
                                maskPosition: "center",
                                WebkitMaskSize: "contain",
                                maskSize: "contain",
                                backgroundColor: "currentColor",
                              }}
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-end justify-between gap-3">
                      <button
                        type="button"
                        className="inline-flex rounded-full border border-[#fecaca] bg-[#FEF2F2] px-3 py-1 text-xs font-semibold text-[#DC2626]"
                        onClick={() => removeItem(item.productoVarianteId)}
                      >
                        Quitar
                      </button>

                      <p className="text-sm font-semibold text-[var(--foreground)]">
                        {formatCurrency(
                          item.precio * item.cantidad,
                          store?.moneda ?? "HNL",
                        )}
                      </p>
                    </div>
                  </article>
                ))}
              </div>

              <aside className="h-fit space-y-4 rounded-[32px] border border-[#dbe7ff] bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] lg:sticky lg:top-3">
                <h2 className="text-base font-semibold text-[var(--foreground-strong)]">
                  Resumen del pedido
                </h2>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B]">Subtotal:</span>
                    <span className="font-medium text-[var(--foreground)]">
                      {formatCurrency(subtotal, store?.moneda ?? "HNL")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-[#dbe7ff] pt-3">
                    <span className="font-semibold text-[var(--foreground)]">
                      Total
                    </span>
                    <span className="text-lg font-bold text-[#2563EB]">
                      {formatCurrency(total, store?.moneda ?? "HNL")}
                    </span>
                  </div>
                </div>

                {!isCheckoutOpen ? (
                  <button
                    type="button"
                    className="inline-flex w-full items-center justify-center rounded-full bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(37,99,235,0.22)]"
                    onClick={() => setIsCheckoutOpen(true)}
                  >
                    Proceder con la compra
                  </button>
                ) : (
                  <form
                    className="space-y-3 rounded-[28px] border border-[#dbe7ff] bg-[#F8FBFF] p-4"
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
                        className="rounded-full border border-[#dbe7ff] bg-white px-3 py-2.5 text-xs font-semibold text-[var(--foreground)] shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
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
                        className="rounded-full bg-[#2563EB] px-3 py-2.5 text-xs font-semibold text-white shadow-[0_14px_30px_rgba(37,99,235,0.22)] disabled:opacity-60"
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
