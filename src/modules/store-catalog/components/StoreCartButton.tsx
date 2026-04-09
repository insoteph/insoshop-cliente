"use client";

import Link from "next/link";

type StoreCartButtonProps = {
  slug: string;
  totalItems: number;
  className?: string;
};

export function StoreCartButton({
  slug,
  totalItems,
  className,
}: StoreCartButtonProps) {
  return (
    <Link
      href={`/${encodeURIComponent(slug)}/carrito`}
      className={`relative inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[#e6e8f2] bg-white px-4 text-sm font-semibold text-[#4736c7] shadow-[0_12px_26px_rgba(104,82,255,0.08)] ${className ?? ""}`}
      aria-label="Ver carrito"
    >
      <span
        aria-hidden="true"
        className="h-4 w-4 text-[#4736c7]"
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
        <span className="absolute -right-2 -top-2 inline-flex min-h-6 min-w-6 items-center justify-center rounded-full bg-[#6d38ff] px-1 text-xs font-bold text-white">
          {totalItems}
        </span>
      ) : null}
    </Link>
  );
}
