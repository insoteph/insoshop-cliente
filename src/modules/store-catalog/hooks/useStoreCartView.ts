"use client";

import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useConfirmationDialog } from "@/modules/core/providers/ConfirmationDialogProvider";
import { usePublicStoreLightMode } from "@/modules/store-catalog/lib/use-public-store-light-mode";
import {
  INITIAL_CHECKOUT_FORM,
  type CheckoutFormState,
  buildCheckoutWhatsAppMessage,
  validateCheckoutForm,
} from "@/modules/store-catalog/lib/store-cart-checkout.utils";
import { useStoreCart } from "@/modules/store-catalog/providers/StoreCartProvider";
import { fetchPublicStoreProducts } from "@/modules/store-catalog/services/store-catalog-service";
import {
  createPublicClient,
  createPublicSale,
  fetchPublicPaymentMethods,
  type PublicPaymentMethod,
} from "@/modules/store-catalog/services/store-checkout-service";
import type { PublicStoreSummary } from "@/modules/store-catalog/types/store-catalog-types";

type UseStoreCartViewProps = {
  slug: string;
};

export function useStoreCartView({ slug }: UseStoreCartViewProps) {
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
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] =
    useState(false);
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

  const openCheckout = useCallback(() => {
    setIsCheckoutOpen(true);
  }, []);

  const closeCheckout = useCallback(() => {
    setIsCheckoutOpen(false);
    setCheckoutError(null);
  }, []);

  const updateCheckoutField = useCallback(
    <K extends keyof CheckoutFormState>(field: K, value: CheckoutFormState[K]) => {
      setCheckoutForm((current) => ({
        ...current,
        [field]: value,
      }));
    },
    [],
  );

  const handleEmptyCart = useCallback(async () => {
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
  }, [clearCart, confirm]);

  const handleCheckoutSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setCheckoutError(null);

      const validationError = validateCheckoutForm(checkoutForm, store, items);
      if (validationError) {
        setCheckoutError(validationError);
        return;
      }

      if (!store?.tiendaId) {
        return;
      }

      setIsSubmittingCheckout(true);

      try {
        const createdClient = await createPublicClient({
          nombreCompleto: checkoutForm.nombreCompleto.trim(),
          telefono: checkoutForm.telefono.trim(),
          tiendaId: store.tiendaId,
        });

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

        const numeroOrden = saleResponse?.numeroOrden ?? "N/A";
        const whatsapp = buildCheckoutWhatsAppMessage({
          storeName: store?.nombre ?? "",
          storePhone: store?.telefono ?? "",
          currency: store?.moneda ?? "HNL",
          orderNumber: numeroOrden,
          form: checkoutForm,
          items,
          total,
        });

        if (whatsapp) {
          window.open(
            `https://wa.me/${whatsapp.digitsOnly}?text=${encodeURIComponent(
              whatsapp.message,
            )}`,
            "_blank",
            "noopener,noreferrer",
          );
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
    },
    [checkoutForm, clearCart, items, store, total],
  );

  return {
    store,
    error,
    isCheckoutOpen,
    checkoutForm,
    paymentMethods,
    isLoadingPaymentMethods,
    checkoutError,
    isSubmittingCheckout,
    subtotal,
    total,
    items,
    removeItem,
    setItemQuantity,
    openCheckout,
    closeCheckout,
    updateCheckoutField,
    handleCheckoutSubmit,
    handleEmptyCart,
  };
}
