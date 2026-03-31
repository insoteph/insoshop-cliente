"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

import { useStoreContext } from "@/modules/stores/context/StoreContext";
import {
  createSale,
  fetchPaymentMethods,
  fetchProductsForSale,
  fetchSaleStates,
  type PaymentMethod,
  type SaleState,
} from "@/modules/sales/services/sale-service";
import type { Product } from "@/modules/products/services/product-service";

type LineItem = {
  productoId: string;
  cantidad: string;
};

export function SalesPanel() {
  const { activeStoreId, activeStore } = useStoreContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [saleStates, setSaleStates] = useState<SaleState[]>([]);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { productoId: "", cantidad: "1" },
  ]);
  const [form, setForm] = useState({
    metodoPagoId: "",
    estadoVentaId: "",
    observacion: "",
  });
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!activeStoreId) {
      return;
    }

    Promise.all([
      fetchProductsForSale(activeStoreId),
      fetchPaymentMethods(activeStoreId),
      fetchSaleStates(),
    ])
      .then(([fetchedProducts, fetchedMethods, fetchedStates]) => {
        setProducts(fetchedProducts);
        setPaymentMethods(fetchedMethods);
        setSaleStates(fetchedStates);
        setForm((current) => ({
          ...current,
          metodoPagoId: current.metodoPagoId || String(fetchedMethods[0]?.id || ""),
          estadoVentaId: current.estadoVentaId || String(fetchedStates[0]?.id || ""),
        }));
      })
      .catch((error) => {
        setFeedback(
          error instanceof Error
            ? error.message
            : "No se pudo preparar el formulario de ventas."
        );
      });
  }, [activeStoreId]);

  const total = useMemo(() => {
    return lineItems.reduce((sum, item) => {
      const product = products.find(
        (currentProduct) => currentProduct.id === Number(item.productoId)
      );

      if (!product) {
        return sum;
      }

      return sum + product.precio * Number(item.cantidad || 0);
    }, 0);
  }, [lineItems, products]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeStoreId) {
      return;
    }

    try {
      const response = await createSale({
        metodoPagoId: Number(form.metodoPagoId),
        estadoVentaId: Number(form.estadoVentaId),
        observacion: form.observacion,
        detalles: lineItems
          .filter((item) => item.productoId)
          .map((item) => ({
            productoId: Number(item.productoId),
            cantidad: Number(item.cantidad),
          })),
      });

      setFeedback(
        `Venta ${response.data.numeroOrden} creada correctamente por ${response.data.total.toFixed(2)}.`
      );
      setLineItems([{ productoId: "", cantidad: "1" }]);
      setForm((current) => ({ ...current, observacion: "" }));
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "No se pudo crear la venta."
      );
    }
  }

  return (
    <section className="section-grid xl:grid-cols-[minmax(0,1fr)_24rem] xl:grid">
      <form className="panel-card space-y-4" onSubmit={handleSubmit}>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          Nueva venta
        </p>
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">
          Venta operativa de {activeStore?.nombre ?? "la tienda activa"}
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <select
            className="field-shell rounded-2xl px-4 py-3 text-sm outline-none"
            value={form.metodoPagoId}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                metodoPagoId: event.target.value,
              }))
            }
          >
            {paymentMethods.map((method) => (
              <option key={method.id} value={method.id}>
                {method.nombre}
              </option>
            ))}
          </select>
          <select
            className="field-shell rounded-2xl px-4 py-3 text-sm outline-none"
            value={form.estadoVentaId}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                estadoVentaId: event.target.value,
              }))
            }
          >
            {saleStates.map((state) => (
              <option key={state.id} value={state.id}>
                {state.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          {lineItems.map((item, index) => (
            <div key={index} className="grid gap-3 md:grid-cols-[1fr_10rem_auto]">
              <select
                className="field-shell rounded-2xl px-4 py-3 text-sm outline-none"
                value={item.productoId}
                onChange={(event) =>
                  setLineItems((current) =>
                    current.map((line, lineIndex) =>
                      lineIndex === index
                        ? { ...line, productoId: event.target.value }
                        : line
                    )
                  )
                }
              >
                <option value="">Selecciona producto</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.nombre}
                  </option>
                ))}
              </select>
              <input
                className="field-shell rounded-2xl px-4 py-3 text-sm outline-none"
                type="number"
                min="1"
                value={item.cantidad}
                onChange={(event) =>
                  setLineItems((current) =>
                    current.map((line, lineIndex) =>
                      lineIndex === index
                        ? { ...line, cantidad: event.target.value }
                        : line
                    )
                  )
                }
              />
              <button
                type="button"
                className="rounded-2xl border border-[var(--line)] px-4 py-3 text-sm font-semibold text-[var(--foreground)]"
                onClick={() =>
                  setLineItems((current) =>
                    current.filter((_, lineIndex) => lineIndex !== index)
                  )
                }
              >
                Quitar
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="rounded-2xl border border-[var(--line)] px-4 py-3 text-sm font-semibold text-[var(--foreground)]"
          onClick={() =>
            setLineItems((current) => [
              ...current,
              { productoId: "", cantidad: "1" },
            ])
          }
        >
          Agregar línea
        </button>

        <textarea
          className="field-shell min-h-32 w-full rounded-2xl px-4 py-3 text-sm outline-none"
          placeholder="Observación"
          value={form.observacion}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              observacion: event.target.value,
            }))
          }
        />

        <button
          type="submit"
          className="rounded-2xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
        >
          Registrar venta
        </button>
        {feedback ? <p className="text-sm text-[var(--muted)]">{feedback}</p> : null}
      </form>

      <aside className="panel-card">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          Resumen
        </p>
        <h3 className="mt-3 text-3xl font-semibold text-[var(--foreground)]">
          {total.toFixed(2)}
        </h3>
        <p className="mt-2 text-sm text-[var(--muted)]">
          El backend valida productos, stock, método de pago y estado de venta
          en una sola transacción.
        </p>
      </aside>
    </section>
  );
}
