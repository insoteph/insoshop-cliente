"use client";

import type { ReactNode } from "react";

import type { DataTableImageConfig } from "./DataTableTypes";

function ImagePlaceholder({
  size = 48,
  className = "",
  iconPath = "/icons/no-image.svg",
}: {
  size?: number;
  className?: string;
  iconPath?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`inline-flex items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--panel-muted)] ${className}`}
      style={{ width: size, height: size }}
    >
      <span
        className="inline-block h-5 w-5 bg-[var(--muted)]"
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
    </div>
  );
}

export function renderImageCell<TData extends Record<string, unknown>>(
  row: TData,
  value: unknown,
  imageConfig?: DataTableImageConfig<TData>,
) {
  const src = typeof value === "string" ? value.trim() : "";
  const width = imageConfig?.width ?? 44;
  const height = imageConfig?.height ?? 44;
  const alt =
    typeof imageConfig?.alt === "function"
      ? imageConfig.alt(row)
      : (imageConfig?.alt ?? "Imagen");

  if (!src) {
    return (
      <ImagePlaceholder
        size={Math.max(width, height)}
        iconPath="/icons/no-image.svg"
      />
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel-muted)] ${
        imageConfig?.className ?? ""
      }`}
      style={{ width, height }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    </div>
  );
}

export function renderCompactImagePreview(srcs: string[], title: string) {
  const [firstImage] = srcs;

  if (!firstImage) {
    return <ImagePlaceholder />;
  }

  return (
    <div className="relative inline-flex overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={firstImage} alt={title} className="h-12 w-12 object-cover" />
      {srcs.length > 1 ? (
        <span className="absolute bottom-1 right-1 rounded-full bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
          +{srcs.length - 1}
        </span>
      ) : null}
    </div>
  );
}

export function renderEmptyImagePlaceholder(size = 44): ReactNode {
  return <ImagePlaceholder size={size} />;
}
