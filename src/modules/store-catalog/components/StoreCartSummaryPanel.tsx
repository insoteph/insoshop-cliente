"use client";

import type { FormEvent } from "react";

import type { CheckoutFormState } from "@/modules/store-catalog/lib/store-cart-checkout.utils";
import { formatCurrency } from "@/modules/core/lib/formatters";
import type { PublicPaymentMethod } from "@/modules/store-catalog/services/store-checkout-service";

type StoreCartSummaryPanelProps = {
  currency: string;
  subtotal: number;
  total: number;
  isCheckoutOpen: boolean;
  checkoutForm: CheckoutFormState;
  paymentMethods: PublicPaymentMethod[];
  isLoadingPaymentMethods: boolean;
  checkoutError: string | null;
  isSubmittingCheckout: boolean;
  onOpenCheckout: () => void;
  onCloseCheckout: () => void;
  onSubmitCheckout: (event: FormEvent<HTMLFormElement>) => void;
  onUpdateField: <K extends keyof CheckoutFormState>(
    field: K,
    value: CheckoutFormState[K],
  ) => void;
};

export function StoreCartSummaryPanel({
  currency,
  subtotal,
  total,
  isCheckoutOpen,
  checkoutForm,
  paymentMethods,
  isLoadingPaymentMethods,
  checkoutError,
  isSubmittingCheckout,
  onOpenCheckout,
  onCloseCheckout,
  onSubmitCheckout,
  onUpdateField,
}: StoreCartSummaryPanelProps) {
  return (
    <aside className="h-fit space-y-4 rounded-[32px] border border-[#dbe7ff] bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] lg:sticky lg:top-3">
      <h2 className="text-base font-semibold text-[var(--foreground-strong)]">
        Resumen del pedido
      </h2>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-[#64748B]">Subtotal:</span>
          <span className="font-medium text-[var(--foreground)]">
            {formatCurrency(subtotal, currency)}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-[#dbe7ff] pt-3">
          <span className="font-semibold text-[var(--foreground)]">Total</span>
          <span className="text-lg font-bold text-[#2563EB]">
            {formatCurrency(total, currency)}
          </span>
        </div>
      </div>

      {!isCheckoutOpen ? (
        <button
          type="button"
          className="inline-flex w-full items-center justify-center rounded-full bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(37,99,235,0.22)]"
          onClick={onOpenCheckout}
        >
          Proceder con la compra
        </button>
      ) : (
        <form
          className="space-y-3 rounded-[28px] border border-[#dbe7ff] bg-[#F8FBFF] p-4"
          onSubmit={onSubmitCheckout}
        >
          <h3 className="text-sm font-semibold text-[var(--foreground-strong)]">
            Datos de compra
          </h3>

          <input
            required
            value={checkoutForm.nombreCompleto}
            onChange={(event) => onUpdateField("nombreCompleto", event.target.value)}
            placeholder="Nombre completo"
            className="app-input w-full rounded-xl px-3 py-2.5 text-sm"
          />

          <input
            required
            value={checkoutForm.telefono}
            onChange={(event) => onUpdateField("telefono", event.target.value)}
            placeholder="Telefono"
            className="app-input w-full rounded-xl px-3 py-2.5 text-sm"
          />

          <select
            required
            value={checkoutForm.metodoPagoId || ""}
            onChange={(event) =>
              onUpdateField("metodoPagoId", Number(event.target.value))
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
              onUpdateField(
                "tipoEntrega",
                event.target.value as "RecogerEnLocal" | "Domicilio",
              )
            }
            className="app-input w-full rounded-xl px-3 py-2.5 text-sm"
          >
            <option value="RecogerEnLocal">Recoger en local</option>
            <option value="Domicilio">A domicilio</option>
          </select>

          <input
            value={checkoutForm.direccion}
            onChange={(event) => onUpdateField("direccion", event.target.value)}
            placeholder="Direccion"
            disabled={checkoutForm.tipoEntrega !== "Domicilio"}
            className="app-input w-full rounded-xl px-3 py-2.5 text-sm disabled:opacity-60"
          />

          <textarea
            value={checkoutForm.observacion}
            onChange={(event) => onUpdateField("observacion", event.target.value)}
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
              onClick={onCloseCheckout}
              disabled={isSubmittingCheckout}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-full bg-[#2563EB] px-3 py-2.5 text-xs font-semibold text-white shadow-[0_14px_30px_rgba(37,99,235,0.22)] disabled:opacity-60"
              disabled={isSubmittingCheckout}
            >
              {isSubmittingCheckout ? "Guardando..." : "Proceder por WhatsApp"}
            </button>
          </div>
        </form>
      )}
    </aside>
  );
}
