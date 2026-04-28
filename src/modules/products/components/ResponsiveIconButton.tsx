"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type ResponsiveIconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode;
  label: string;
};

export function ResponsiveIconButton({
  icon,
  label,
  children,
  className = "",
  ...props
}: ResponsiveIconButtonProps) {
  const content = children ?? label;

  return (
    <button
      {...props}
      aria-label={label}
      title={label}
      className={`${className} inline-flex items-center gap-2`}
    >
        <span aria-hidden="true" className="inline-flex">
          {icon}
        </span>
        <span className="hidden sm:inline">{content}</span>
    </button>
  );
}
