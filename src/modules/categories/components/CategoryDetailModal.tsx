"use client";

import { DetailModal } from "@/modules/core/components/DetailModal";
import type { Category } from "@/modules/categories/services/category-service";

type CategoryDetailModalProps = {
  open: boolean;
  category: Category | null;
  onClose: () => void;
};

function StatusChip({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${
        active
          ? "bg-[#ECFDF5] text-[#059669]"
          : "bg-[#FEF2F2] text-[#DC2626]"
      }`}
    >
      {active ? "Activa" : "Inactiva"}
    </span>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] p-4 shadow-[0_10px_22px_rgba(15,23,42,0.04)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-[var(--foreground-strong)]">
        {value}
      </p>
    </div>
  );
}

export function CategoryDetailModal({
  open,
  category,
  onClose,
}: CategoryDetailModalProps) {
  if (!category) {
    return null;
  }

  return (
    <DetailModal
      open={open}
      title={category.nombre}
      subtitle={
        <div className="flex flex-wrap items-center gap-2">
          <span>{category.tiendaNombre}</span>
          <span className="text-[var(--line-strong)]">•</span>
          <span>ID {category.id}</span>
          <StatusChip active={category.estado} />
        </div>
      }
      size="md"
      onClose={onClose}
    >
      <div className="space-y-5">
        <div className="overflow-hidden rounded-[28px] border border-[var(--line)] bg-[linear-gradient(135deg,rgba(37,99,235,0.12),rgba(29,78,216,0.04))] p-5 shadow-[0_14px_32px_rgba(15,23,42,0.05)]">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2563EB]">
                Categoria
              </p>
              <h3 className="text-2xl font-semibold leading-tight text-[var(--foreground-strong)]">
                {category.nombre}
              </h3>
            </div>

            <StatusChip active={category.estado} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <InfoCard label="Nombre" value={category.nombre} />
          <InfoCard label="Tienda" value={category.tiendaNombre} />
          <InfoCard
            label="Estado"
            value={category.estado ? "Activa" : "Inactiva"}
          />
        </div>
      </div>
    </DetailModal>
  );
}
