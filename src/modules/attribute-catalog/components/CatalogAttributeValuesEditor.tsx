"use client";

import { CatalogAttributeValueRow } from "@/modules/attribute-catalog/components/CatalogAttributeValueRow";
import type { CatalogAttributeFormValue } from "@/modules/attribute-catalog/types/catalog-attribute-form.types";

type CatalogAttributeValuesEditorProps = {
  values: CatalogAttributeFormValue[];
  onAddValue: () => void;
  onRemoveValue: (valueId: string) => void;
  onTextChange: (valueId: string, valor: string) => void;
  onColorToggle: (valueId: string, usaColor: boolean) => void;
  onColorChange: (valueId: string, colorHexadecimal: string) => void;
  onOrderChange: (valueId: string, orden: string) => void;
};

export function CatalogAttributeValuesEditor({
  values,
  onAddValue,
  onRemoveValue,
  onTextChange,
  onColorToggle,
  onColorChange,
  onOrderChange,
}: CatalogAttributeValuesEditorProps) {
  return (
    <section className="space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--panel-strong)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h5 className="text-sm font-semibold text-[var(--foreground-strong)]">
            Valores del atributo
          </h5>
        </div>
      </div>

      <div className="divide-y divide-[var(--line)]/60">
        {values.map((value, index) => (
          <CatalogAttributeValueRow
            key={value.id}
            value={value}
            index={index}
            canRemove={values.length > 1}
            onTextChange={onTextChange}
            onColorToggle={onColorToggle}
            onColorChange={onColorChange}
            onOrderChange={onOrderChange}
            onRemove={onRemoveValue}
          />
        ))}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          className="app-button-secondary inline-flex h-10 items-center rounded-xl px-3 text-sm font-semibold"
          onClick={onAddValue}
        >
          Agregar valor
        </button>
      </div>
    </section>
  );
}

