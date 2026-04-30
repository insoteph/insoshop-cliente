"use client";

import Link from "next/link";

import { FloatingWhatsAppButton } from "@/modules/store-catalog/components/FloatingWhatsAppButton";
import { StoreCartEmptyState } from "@/modules/store-catalog/components/StoreCartEmptyState";
import { StoreCartItemsList } from "@/modules/store-catalog/components/StoreCartItemsList";
import { StoreCartSummaryPanel } from "@/modules/store-catalog/components/StoreCartSummaryPanel";
import { StoreCatalogFooter } from "@/modules/store-catalog/components/StoreCatalogFooter";
import { storeCatalogThemeTokens } from "@/modules/store-catalog/lib/store-catalog-theme-tokens";
import { useStoreCartView } from "@/modules/store-catalog/hooks/useStoreCartView";

type StoreCartViewProps = {
  slug: string;
};

function StoreCartContent({ slug }: StoreCartViewProps) {
  const {
    store,
    error,
    items,
    subtotal,
    total,
    isCheckoutOpen,
    checkoutForm,
    paymentMethods,
    isLoadingPaymentMethods,
    checkoutError,
    isSubmittingCheckout,
    removeItem,
    setItemQuantity,
    openCheckout,
    closeCheckout,
    updateCheckoutField,
    handleCheckoutSubmit,
    handleEmptyCart,
  } = useStoreCartView({ slug });

  return (
    <div className="bg-[var(--background)]" style={storeCatalogThemeTokens.light}>
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
                onClick={handleEmptyCart}
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
            <StoreCartEmptyState />
          ) : (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              <StoreCartItemsList
                items={items}
                currency={store?.moneda ?? "HNL"}
                onRemove={removeItem}
                onDecrease={(productoVarianteId, currentQuantity) =>
                  setItemQuantity(productoVarianteId, currentQuantity - 1)
                }
                onIncrease={(productoVarianteId, currentQuantity) =>
                  setItemQuantity(productoVarianteId, currentQuantity + 1)
                }
              />

              <StoreCartSummaryPanel
                currency={store?.moneda ?? "HNL"}
                subtotal={subtotal}
                total={total}
                isCheckoutOpen={isCheckoutOpen}
                checkoutForm={checkoutForm}
                paymentMethods={paymentMethods}
                isLoadingPaymentMethods={isLoadingPaymentMethods}
                checkoutError={checkoutError}
                isSubmittingCheckout={isSubmittingCheckout}
                onOpenCheckout={openCheckout}
                onCloseCheckout={closeCheckout}
                onSubmitCheckout={handleCheckoutSubmit}
                onUpdateField={updateCheckoutField}
              />
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
  return <StoreCartContent slug={slug} />;
}
