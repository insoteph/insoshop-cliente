"use client";

import { AppButton } from "@/modules/core/components/AppButton";

type ProductEditorHeaderProps = {
  title: string;
  onBack: () => void;
};

export function ProductEditorHeader({
  title,
  onBack,
}: ProductEditorHeaderProps) {
  return (
    <div className="app-card rounded-2xl px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <AppButton
          variant="secondary"
          iconPath="/icons/left.svg"
          onClick={onBack}
        >
          Volver
        </AppButton>

        <div className="min-w-0 text-right">
          <h1 className="text-[0.98rem] font-semibold tracking-tight text-[var(--foreground-strong)] sm:text-[1.05rem]">
            {title}
          </h1>
        </div>
      </div>
    </div>
  );
}
