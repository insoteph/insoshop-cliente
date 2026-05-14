"use client";

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
