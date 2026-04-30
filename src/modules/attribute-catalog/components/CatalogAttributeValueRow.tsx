"use client";

import { MaterialInput } from "@/modules/core/components/MaterialInput";
import type { CatalogAttributeFormValue } from "@/modules/attribute-catalog/types/catalog-attribute-form.types";

function TrashIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block ${className}`}
      style={{
        WebkitMaskImage: "url(/icons/trash.svg)",
        maskImage: "url(/icons/trash.svg)",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        backgroundColor: "currentColor",
      }}
    />
  );
}

type CatalogAttributeValueRowProps = {
  value: CatalogAttributeFormValue;
  index: number;
  canRemove: boolean;
  onTextChange: (valueId: string, valor: string) => void;
  onColorToggle: (valueId: string, usaColor: boolean) => void;
  onColorChange: (valueId: string, colorHexadecimal: string) => void;
  onOrderChange: (valueId: string, orden: string) => void;
  onRemove: (valueId: string) => void;
};

export function CatalogAttributeValueRow({
  value,
  index,
  canRemove,
  onTextChange,
  onColorToggle,
  onColorChange,
  onOrderChange,
  onRemove,
}: CatalogAttributeValueRowProps) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 py-3 first:pt-0 last:pb-0 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_120px_auto] xl:items-end">
      <MaterialInput
        id={`catalog-value-${value.id}`}
        label={`Valor ${index + 1}`}
        value={value.valor}
        onChange={(event) => onTextChange(value.id, event.target.value)}
      />

      <div className="flex h-12 items-center justify-between gap-3 rounded-2xl border border-[var(--line)] px-3 text-sm text-[var(--foreground)]">
        <label className="flex cursor-pointer items-center gap-2 font-semibold">
          <input
            type="checkbox"
            checked={value.usaColor}
            onChange={(event) => onColorToggle(value.id, event.target.checked)}
            className="h-4 w-4 accent-[var(--primary)]"
          />
          Es color
        </label>

        {value.usaColor ? (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={value.colorHexadecimal}
              onChange={(event) => onColorChange(value.id, event.target.value)}
              className="h-9 w-11 cursor-pointer rounded-lg border border-[var(--line)] bg-transparent p-1"
              aria-label={`Color para ${value.valor || `valor ${index + 1}`}`}
            />
            <span className="hidden text-[11px] font-semibold uppercase text-[var(--muted)] sm:inline">
              {value.colorHexadecimal}
            </span>
          </div>
        ) : null}
      </div>

      <MaterialInput
        id={`catalog-order-${value.id}`}
        label="Orden"
        type="number"
        min="0"
        value={value.orden}
        onChange={(event) => onOrderChange(value.id, event.target.value)}
      />

      <button
        type="button"
        className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-red-200/80 bg-red-50/70 text-red-600 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-100 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/70 disabled:translate-y-0 disabled:opacity-60"
        onClick={() => onRemove(value.id)}
        disabled={!canRemove}
        aria-label={`Quitar ${value.valor || `valor ${index + 1}`}`}
        title="Quitar valor"
      >
        <TrashIcon />
      </button>
    </div>
  );
}

