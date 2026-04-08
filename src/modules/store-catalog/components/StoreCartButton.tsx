"use client";

import Link from "next/link";

type StoreCartButtonProps = {
  slug: string;
  totalItems: number;
};

export function StoreCartButton({ slug, totalItems }: StoreCartButtonProps) {
  return (
    <Link
      href={`/${encodeURIComponent(slug)}/carrito`}
      className="relative inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 text-sm font-semibold text-[var(--foreground)]"
      aria-label="Ver carrito"
    >
      <span
        aria-hidden="true"
        className="h-4 w-4 text-[var(--foreground)]"
        style={{
          WebkitMaskImage: "url(/icons/Cart.svg)",
          maskImage: "url(/icons/Cart.svg)",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          WebkitMaskSize: "contain",
          maskSize: "contain",
          backgroundColor: "currentColor",
        }}
      />
      <span>Carrito</span>
      {totalItems > 0 ? (
        <span className="absolute -right-2 -top-2 inline-flex min-h-6 min-w-6 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-xs font-bold text-white">
          {totalItems}
        </span>
      ) : null}
    </Link>
  );
}
