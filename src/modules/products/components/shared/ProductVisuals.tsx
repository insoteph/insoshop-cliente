"use client";

import { ImagePlaceholder } from "@/modules/core/components/ImagePlaceholder";

export function ColorSwatch({
  colorHexadecimal,
  className = "h-3.5 w-3.5",
}: {
  colorHexadecimal: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex rounded-full border border-[var(--line)] ${className}`}
      style={{ backgroundColor: colorHexadecimal }}
    />
  );
}

export function NoImageThumbnail({
  size = 56,
  className = "inline-flex items-center justify-center overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)]",
  iconClassName = "h-6 w-6",
}: {
  size?: number;
  className?: string;
  iconClassName?: string;
}) {
  return <ImagePlaceholder size={size} className={className} iconClassName={iconClassName} />;
}
