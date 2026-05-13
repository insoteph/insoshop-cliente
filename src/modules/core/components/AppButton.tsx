"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type AppButtonVariant = "primary" | "secondary" | "danger" | "cancel";

type AppButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: AppButtonVariant;
  iconPath?: string;
  children: ReactNode;
};

const VARIANT_CLASSES: Record<AppButtonVariant, string> = {
  primary: "",
  secondary:
    "border-[var(--line)] bg-[var(--panel-strong)] text-[var(--foreground)] hover:bg-[var(--panel-muted)]",
  danger:
    "border-[color-mix(in_srgb,var(--danger)_40%,transparent)] bg-[var(--danger)] text-white hover:bg-[color-mix(in_srgb,var(--danger)_88%,black_12%)]",
  cancel: "app-button-cancel",
};

export function AppButton({
  variant = "primary",
  iconPath,
  className,
  children,
  type = "button",
  ...buttonProps
}: AppButtonProps) {
  return (
    <button
      type={type}
      className={`app-button-action cursor-pointer ${VARIANT_CLASSES[variant]} ${
        className ?? ""
      }`}
      {...buttonProps}
    >
      {iconPath ? (
        <span
          aria-hidden="true"
          className="h-4 w-4 shrink-0 bg-current"
          style={{
            WebkitMaskImage: `url(${iconPath})`,
            maskImage: `url(${iconPath})`,
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
            WebkitMaskSize: "contain",
            maskSize: "contain",
          }}
        />
      ) : null}
      <span>{children}</span>
    </button>
  );
}
