"use client";

import { formatCurrency } from "@/modules/core/lib/formatters";
import type { StoreCartItem } from "@/modules/store-catalog/types/store-cart-types";
import type { PublicStoreSummary } from "@/modules/store-catalog/types/store-catalog-types";

export type CheckoutFormState = {
  nombreCompleto: string;
  telefono: string;
  metodoPagoId: number;
  tipoEntrega: "RecogerEnLocal" | "Domicilio";
  direccion: string;
  observacion: string;
};

export const INITIAL_CHECKOUT_FORM: CheckoutFormState = {
  nombreCompleto: "",
  telefono: "",
  metodoPagoId: 0,
  tipoEntrega: "RecogerEnLocal",
  direccion: "",
  observacion: "",
};

export function validateCheckoutForm(
  form: CheckoutFormState,
  store: PublicStoreSummary | null,
  items: StoreCartItem[],
) {
  if (!store?.tiendaId) {
    return "No se pudo identificar la tienda para crear la venta.";
  }

  if (!form.metodoPagoId) {
    return "Selecciona un metodo de pago para continuar.";
  }

  if (form.tipoEntrega === "Domicilio" && !form.direccion.trim()) {
    return "La direccion es obligatoria para entregas a domicilio.";
  }

  if (items.length === 0) {
    return "El carrito esta vacio.";
  }

  return null;
}

export function buildCheckoutWhatsAppMessage(payload: {
  storeName: string;
  storePhone: string;
  currency: string;
  orderNumber: string;
  form: CheckoutFormState;
  items: StoreCartItem[];
  total: number;
}) {
  const { storeName, storePhone, currency, orderNumber, form, items, total } =
    payload;

  const digitsOnly = storePhone.replace(/\D+/g, "");
  if (!digitsOnly) {
    return null;
  }

  const lines = [
    `Hola ${storeName} 👋`,
    `Quisiera realizar la siguiente compra desde el catálogo digital:`,
    ``,
    `━━━━━━━━━━━━━━━━━━`,
    `🧾 *DETALLE DE LA ORDEN*`,
    `━━━━━━━━━━━━━━━━━━`,
    `Número de orden: ${orderNumber}`,
    ``,
    `👤 *CLIENTE*`,
    `${form.nombreCompleto.trim() || "Sin nombre"}`,
    `Teléfono: ${form.telefono.trim() || "Sin telefono"}`,
    ``,
    `🚚 *TIPO DE ENTREGA*`,
    `${form.tipoEntrega === "Domicilio" ? "A domicilio" : "Recoger en local"}`,
    form.tipoEntrega === "Domicilio" && form.direccion.trim()
      ? `📍 Dirección:\n${form.direccion.trim()}`
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
          currency,
        )}`,
    ),
    `━━━━━━━━━━━━━━━━━━`,
    ``,
    `💰 *TOTAL A PAGAR*`,
    `${formatCurrency(total, currency)}`,
    ``,
    `━━━━━━━━━━━━━━━━━━`,
    `Gracias por tu compra 🤝`,
    `Un encargado estará confirmando y procesando tu pedido en breve.`,
    `Agradecemos tu preferencia en ${storeName}.`,
  ].filter(Boolean);

  return {
    digitsOnly,
    message: lines.join("\n"),
  };
}
