"use client";

import { formatCurrency } from "@/modules/core/lib/formatters";
import {
  type SaleDetailAttribute,
  type SaleDetailItem,
} from "@/modules/sales/services/sales-service";

type SaleDetailItemsTableProps = {
  items: SaleDetailItem[];
  currency: string;
};

function SaleImage({ src, alt }: { src: string | null; alt: string }) {
  if (!src) {
    return (
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel-muted)]"
        aria-hidden="true"
      >
        <span
          className="inline-block h-6 w-6"
          style={{
            backgroundColor: "var(--muted)",
            WebkitMaskImage: "url(/icons/no-image.svg)",
            maskImage: "url(/icons/no-image.svg)",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
            WebkitMaskSize: "contain",
            maskSize: "contain",
          }}
        />
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="h-12 w-12 shrink-0 rounded-xl border border-[var(--line)] object-cover"
    />
  );
}

function AttributePill({ attribute }: { attribute: SaleDetailAttribute }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[color-mix(in_srgb,var(--accent)_18%,transparent)] bg-[color-mix(in_srgb,var(--accent-soft)_50%,var(--panel)_50%)] px-2 py-0.5 text-[10px] font-medium text-[var(--foreground)]">
      <span className="text-[var(--muted)]">{attribute.atributoCatalogoNombre}:</span>
      <span>{attribute.valor}</span>
    </span>
  );
}

export function SaleDetailItemsTable({
  items,
  currency,
}: SaleDetailItemsTableProps) {
  return (
    <>
      <div className="overflow-hidden rounded-xl border border-[var(--line)] md:hidden">
        {items.map((item) => (
          <article
            key={item.productoVarianteId}
            className="border-b border-[var(--line)] bg-[var(--panel)] px-3 py-2.5 last:border-b-0"
          >
            <div className="flex items-start gap-2.5">
              <SaleImage src={item.urlImagen} alt={item.nombreProducto} />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                  {item.nombreProducto}
                </p>
                <p className="text-[11px] text-[var(--muted)]">
                  Variante #{item.productoVarianteId}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
                  Precio
                </p>
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {formatCurrency(item.precioUnitario, currency)}
                </p>
              </div>
            </div>

            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {item.valores.length > 0 ? (
                item.valores.map((attribute) => (
                  <AttributePill
                    key={`${item.productoVarianteId}-${attribute.atributoCatalogoId}-${attribute.atributoCatalogoValorId}`}
                    attribute={attribute}
                  />
                ))
              ) : (
                <span className="text-[11px] text-[var(--muted)]">Sin atributos</span>
              )}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[var(--line)] pt-2.5 text-sm">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
                  Cantidad
                </p>
                <p className="mt-0.5 text-sm font-medium text-[var(--foreground)]">
                  {item.cantidad}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
                  Subtotal
                </p>
                <p className="mt-0.5 text-sm font-medium text-[var(--foreground)]">
                  {formatCurrency(item.subTotal, currency)}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-[var(--line)] md:block">
        <table className="min-w-full divide-y divide-[var(--line)]">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-[var(--muted)]">
              <th className="px-2 py-1.5">Producto</th>
              <th className="px-2 py-1.5">Atributos</th>
              <th className="px-2 py-1.5">Cantidad</th>
              <th className="px-2 py-1.5">Precio</th>
              <th className="px-2 py-1.5">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {items.map((item) => (
              <tr key={item.productoVarianteId}>
                <td className="px-2 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <SaleImage src={item.urlImagen} alt={item.nombreProducto} />
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-[var(--foreground)]">
                        {item.nombreProducto}
                      </p>
                      <p className="text-[11px] text-[var(--muted)]">
                        Variante #{item.productoVarianteId}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-2 py-2.5">
                  <div className="flex flex-wrap gap-1">
                    {item.valores.length > 0 ? (
                      item.valores.map((attribute) => (
                        <AttributePill
                          key={`${item.productoVarianteId}-${attribute.atributoCatalogoId}-${attribute.atributoCatalogoValorId}`}
                          attribute={attribute}
                        />
                      ))
                    ) : (
                      <span className="text-[11px] text-[var(--muted)]">
                        Sin atributos
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-2 py-2.5 text-[13px] text-[var(--foreground)]">
                  {item.cantidad}
                </td>
                <td className="px-2 py-2.5 text-[13px] text-[var(--foreground)]">
                  {formatCurrency(item.precioUnitario, currency)}
                </td>
                <td className="px-2 py-2.5 text-[13px] font-medium text-[var(--foreground)]">
                  {formatCurrency(item.subTotal, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
