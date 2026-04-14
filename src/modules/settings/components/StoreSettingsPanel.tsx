"use client";

import { PaymentMethodsSettingsPanel } from "@/modules/settings/components/PaymentMethodsSettingsPanel";

type StoreSettingsPanelProps = {
  storeId: number;
  hasGlobalAccess: boolean;
  canTogglePaymentMethods: boolean;
};

export function StoreSettingsPanel({
  storeId,
  hasGlobalAccess,
  canTogglePaymentMethods,
}: StoreSettingsPanelProps) {
  return (
    <section className="space-y-6">
      <div className="rounded-md border border-[var(--line)] bg-[var(--panel)] p-5 shadow-md">
        <h3 className="text-lg font-semibold text-[var(--foreground)]">
          Configuraciones
        </h3>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Desde aqui administras parametros comerciales por tienda.
        </p>
      </div>

      <PaymentMethodsSettingsPanel
        storeId={storeId}
        hasGlobalAccess={hasGlobalAccess}
        canToggle={canTogglePaymentMethods}
      />
    </section>
  );
}

