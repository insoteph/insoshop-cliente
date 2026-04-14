"use client";

import Link from "next/link";

import { formatCurrency } from "@/modules/core/lib/formatters";
import type { StoreFavoriteProduct } from "@/modules/store-catalog/lib/store-favorites-storage";

type StoreFavoritesPanelProps = {
  slug: string;
  currency: string;
  items: StoreFavoriteProduct[];
  isOpen: boolean;
  onToggle: () => void;
  onRemoveFavorite: (productId: number) => void;
};

export function StoreFavoritesPanel({
  slug,
  currency,
  items,
  isOpen,
  onToggle,
  onRemoveFavorite,
}: StoreFavoritesPanelProps) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="relative inline-flex h-11 w-11 items-center justify-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--panel-strong)] px-3 text-sm font-semibold text-[var(--foreground)] shadow-[var(--shadow)] hover:border-[var(--line-strong)] sm:w-auto sm:px-4"
      >
        <span
          aria-hidden="true"
          className="h-4 w-4 text-[#e53935]"
          style={{
            WebkitMaskImage: "url(/icons/heart.svg)",
            maskImage: "url(/icons/heart.svg)",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
            WebkitMaskSize: "contain",
            maskSize: "contain",
            backgroundColor: "currentColor",
          }}
        />
        <span className="hidden sm:inline">Favoritos</span>
        {items.length > 0 ? (
          <span className="absolute -right-2 -top-2 inline-flex min-h-6 min-w-6 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-xs font-bold text-white">
            {items.length}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-[calc(100%+10px)] z-30 w-[min(92vw,360px)] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel-strong)] shadow-[0_26px_60px_rgba(20,26,48,0.25)]">
          <div className="border-b border-[var(--line)] px-4 py-3">
            <p className="text-sm font-semibold text-[var(--foreground-strong)]">
              Mis favoritos
            </p>
            <p className="text-xs text-[var(--muted)]">Solo para esta tienda</p>
          </div>

          {items.length === 0 ? (
            <div className="px-4 py-5 text-sm text-[var(--muted)]">
              Aun no has marcado productos.
            </div>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 border-b border-[var(--line)] px-4 py-3 last:border-b-0"
                >
                  <Link
                    href={`/${encodeURIComponent(slug)}/productos/${item.id}`}
                    className="min-w-0 flex-1"
                  >
                    <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                      {item.nombre}
                    </p>
                    <p className="text-xs text-[var(--muted)]">{item.categoria}</p>
                    <p className="text-xs font-semibold text-[var(--accent)]">
                      {formatCurrency(item.precio, currency)}
                    </p>
                  </Link>
                  <button
                    type="button"
                    onClick={() => onRemoveFavorite(item.id)}
                    className="rounded-xl border border-[var(--line)] px-2 py-1 text-xs font-semibold text-[var(--muted)] hover:border-[var(--line-strong)] hover:text-[var(--foreground)]"
                  >
                    Quitar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
