"use client";

import { useMemo, useState } from "react";

type ProductImageGalleryProps = {
  productName: string;
  imageUrls: string[];
};

export function ProductImageGallery({
  productName,
  imageUrls,
}: ProductImageGalleryProps) {
  const images = useMemo(
    () => imageUrls.map((image) => image.trim()).filter(Boolean).slice(0, 4),
    [imageUrls],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOrigin, setZoomOrigin] = useState("50% 50%");
  const [isZooming, setIsZooming] = useState(false);

  const activeImage = images[activeIndex];

  if (!activeImage) {
    return (
      <div className="app-card-muted flex h-[460px] items-center justify-center rounded-3xl border border-dashed border-[var(--line)] text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
        NO IMAGE
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className="relative h-[460px] overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--panel-muted)]"
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
        <div className="grid grid-cols-4 gap-2">
          {images.map((imageUrl, index) => (
            <button
              key={`${imageUrl}-${index}`}
              type="button"
              className={`relative h-24 overflow-hidden rounded-xl border ${
                activeIndex === index
                  ? "border-[var(--accent)]"
                  : "border-[var(--line)]"
              }`}
              onClick={() => setActiveIndex(index)}
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
      ) : null}
    </div>
  );
}
