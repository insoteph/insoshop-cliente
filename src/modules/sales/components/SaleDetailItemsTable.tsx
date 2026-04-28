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
        className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)]"
        aria-hidden="true"
      >
        <span
          className="inline-block h-7 w-7"
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
      className="h-14 w-14 shrink-0 rounded-2xl border border-[var(--line)] object-cover"
    />
  );
}

function AttributePill({ attribute }: { attribute: SaleDetailAttribute }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[color-mix(in_srgb,var(--accent)_18%,transparent)] bg-[color-mix(in_srgb,var(--accent-soft)_50%,var(--panel)_50%)] px-2.5 py-1 text-[11px] font-medium text-[var(--foreground)]">
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
      <div className="space-y-3 md:hidden">
        {items.map((item) => (
          <article
            key={item.productoVarianteId}
            className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <SaleImage src={item.urlImagen} alt={item.nombreProducto} />

              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-[var(--foreground)]">
                  {item.nombreProducto}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  Variante #{item.productoVarianteId}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                  Precio
                </p>
                <p className="font-semibold text-[var(--foreground)]">
                  {formatCurrency(item.precioUnitario, currency)}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {item.valores.length > 0 ? (
                item.valores.map((attribute) => (
                  <AttributePill
                    key={`${item.productoVarianteId}-${attribute.atributoCatalogoId}-${attribute.atributoCatalogoValorId}`}
                    attribute={attribute}
                  />
                ))
              ) : (
                <span className="text-sm text-[var(--muted)]">Sin atributos</span>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--line)] pt-3 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                  Cantidad
                </p>
                <p className="mt-1 font-medium text-[var(--foreground)]">
                  {item.cantidad}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                  Subtotal
                </p>
                <p className="mt-1 font-medium text-[var(--foreground)]">
                  {formatCurrency(item.subTotal, currency)}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--line)]">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-[var(--muted)]">
              <th className="px-3 py-2">Producto</th>
              <th className="px-3 py-2">Atributos</th>
              <th className="px-3 py-2">Cantidad</th>
              <th className="px-3 py-2">Precio</th>
              <th className="px-3 py-2">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {items.map((item) => (
              <tr key={item.productoVarianteId}>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <SaleImage src={item.urlImagen} alt={item.nombreProducto} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--foreground)]">
                        {item.nombreProducto}
                      </p>
                      <p className="text-xs text-[var(--muted)]">
                        Variante #{item.productoVarianteId}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {item.valores.length > 0 ? (
                      item.valores.map((attribute) => (
                        <AttributePill
                          key={`${item.productoVarianteId}-${attribute.atributoCatalogoId}-${attribute.atributoCatalogoValorId}`}
                          attribute={attribute}
                        />
                      ))
                    ) : (
                      <span className="text-sm text-[var(--muted)]">
                        Sin atributos
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-3 text-sm text-[var(--foreground)]">
                  {item.cantidad}
                </td>
                <td className="px-3 py-3 text-sm text-[var(--foreground)]">
                  {formatCurrency(item.precioUnitario, currency)}
                </td>
                <td className="px-3 py-3 text-sm font-medium text-[var(--foreground)]">
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
