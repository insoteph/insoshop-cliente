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
      <div className="flex aspect-[4/5] items-center justify-center border border-dashed border-[#dbe7ff] bg-[#F8FBFF] text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)] shadow-[0_18px_40px_rgba(15,23,42,0.06)] sm:aspect-auto sm:h-[400px] lg:h-[440px]">
        NO IMAGE
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className="relative aspect-[4/5] overflow-hidden rounded-[10px] bg-[#F8FBFF] sm:aspect-[3/4] sm:h-auto lg:aspect-[15/16] lg:h-auto xl:aspect-[15/16]"
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
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[#64748B]">
                Galeria
              </p>
              <p className="text-xs text-[var(--muted)]">
                {images.length} imagen{images.length === 1 ? "" : "es"} disponibles
              </p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
          {images.map((imageUrl, index) => (
            <button
              key={`${imageUrl}-${index}`}
              type="button"
              className={`relative h-20 overflow-hidden rounded-xl border bg-white shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition ${
                activeIndex === index
                  ? "border-[#2563EB] shadow-[0_0_0_2px_rgba(37,99,235,0.14)]"
                  : "border-[#dbe7ff] hover:border-[#9bb8ff]"
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
        </div>
      ) : null}
    </div>
  );
}
