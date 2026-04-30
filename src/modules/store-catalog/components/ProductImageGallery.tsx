"use client";

import { useMemo, useState } from "react";

type ProductImageGalleryProps = {
  productName: string;
  imageUrls: string[];
  onImageSelect?: (imageUrl: string) => void;
};

export function ProductImageGallery({
  productName,
  imageUrls,
  onImageSelect,
}: ProductImageGalleryProps) {
  const images = useMemo(
    () =>
      imageUrls
        .map((image) => image.trim())
        .filter(Boolean)
        .slice(0, 4),
    [imageUrls],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOrigin, setZoomOrigin] = useState("50% 50%");
  const [isZooming, setIsZooming] = useState(false);

  const activeImage = images[activeIndex];

  if (!activeImage) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl border border-dashed border-[var(--line)] bg-[var(--panel-muted)] text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)] shadow-[0_12px_28px_rgba(15,23,42,0.05)] sm:aspect-auto sm:h-[400px] sm:text-sm sm:tracking-[0.2em] lg:h-[440px]">
        NO IMAGE
      </div>
    );
  }

  return (
    <div className="space-y-2.5 sm:space-y-3">
      <div
        className="relative aspect-square overflow-hidden rounded-2xl bg-[var(--panel-muted)] sm:aspect-[3/4] sm:h-auto sm:rounded-[10px] lg:aspect-[15/16] lg:h-auto xl:aspect-[15/16]"
        onMouseEnter={() => setIsZooming(true)}
        onMouseLeave={() => {
          setIsZooming(false);
          setZoomOrigin("50% 50%");
        }}
        onMouseMove={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          const x = ((event.clientX - bounds.left) / bounds.width) * 100;
          const y = ((event.clientY - bounds.top) / bounds.height) * 100;
          setZoomOrigin(`${x}% ${y}%`);
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeImage}
          alt={productName}
          className={`h-full w-full object-cover transition-transform duration-200 ${
            isZooming ? "scale-[1.9]" : "scale-100"
          }`}
          style={{ transformOrigin: zoomOrigin }}
        />
      </div>

      {images.length > 1 ? (
        <div className="space-y-2">
          <div className="hidden items-center justify-between gap-3 sm:flex">
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                Galeria
              </p>
              <p className="text-xs text-[var(--muted)]">
                {images.length} imagen{images.length === 1 ? "" : "es"} disponibles
              </p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            {images.map((imageUrl, index) => (
              <button
                key={`${imageUrl}-${index}`}
                type="button"
                className={`relative h-14 overflow-hidden rounded-xl border bg-[var(--panel-strong)] shadow-[0_8px_18px_rgba(15,23,42,0.05)] transition active:scale-[0.97] sm:h-20 sm:shadow-[0_10px_24px_rgba(15,23,42,0.06)] ${
                  activeIndex === index
                    ? "border-[var(--accent)] shadow-[0_0_0_2px_rgba(37,99,235,0.14)]"
                    : "border-[var(--line)] hover:border-[var(--line-strong)]"
                }`}
                onClick={() => {
                  setActiveIndex(index);
                  onImageSelect?.(imageUrl);
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={`${productName} miniatura ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
