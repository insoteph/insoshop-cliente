"use client";

import { PanelSectionHeader } from "@/modules/core/components/PanelSectionHeader";
import { PaymentMethodsSettingsPanel } from "@/modules/settings/components/PaymentMethodsSettingsPanel";

type StoreSettingsPanelProps = {
  storeId: number;
  hasGlobalAccess: boolean;
  canCreatePaymentMethods: boolean;
  canEditPaymentMethods: boolean;
  canTogglePaymentMethods: boolean;
};

export function StoreSettingsPanel({
  storeId,
  hasGlobalAccess,
  canCreatePaymentMethods,
  canEditPaymentMethods,
  canTogglePaymentMethods,
}: StoreSettingsPanelProps) {
  return (
    <section className="space-y-6">
      <div className="app-card overflow-hidden rounded-2xl shadow-[0_12px_30px_rgba(15,23,42,0.07)]">
        <div className="px-4 py-4 md:px-5 md:py-5">
        <PanelSectionHeader
          title="Configuraciones"
          subtitle="Desde aqui administras parametros comerciales por tienda."
          headingLevel="h3"
        />
        </div>
      </div>

      <PaymentMethodsSettingsPanel
        storeId={storeId}
        hasGlobalAccess={hasGlobalAccess}
        canCreate={canCreatePaymentMethods}
        canEdit={canEditPaymentMethods}
        canToggle={canTogglePaymentMethods}
      />
    </section>
  );
}
