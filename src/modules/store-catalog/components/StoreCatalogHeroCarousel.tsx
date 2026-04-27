"use client";

import { useEffect, useMemo, useState } from "react";

import heroCarouselConfig from "@/modules/store-catalog/data/hero-carousel.json";

type StoreCatalogHeroCarouselSlide = {
  image: string;
  alt: string;
};

type StoreCatalogHeroCarouselConfig = {
  intervalMs?: number;
  slides: StoreCatalogHeroCarouselSlide[];
};

const defaultConfig = heroCarouselConfig as StoreCatalogHeroCarouselConfig;

type StoreCatalogHeroCarouselProps = {
  slides?: StoreCatalogHeroCarouselSlide[];
  intervalMs?: number;
};

export function StoreCatalogHeroCarousel({
  slides = defaultConfig.slides,
  intervalMs = defaultConfig.intervalMs ?? 3000,
}: StoreCatalogHeroCarouselProps) {
  const normalizedSlides = useMemo(
    () => slides.filter((slide) => slide.image.trim().length > 0),
    [slides],
  );
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (normalizedSlides.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % normalizedSlides.length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [intervalMs, normalizedSlides.length]);

  if (normalizedSlides.length === 0) {
    return null;
  }

  return (
    <section
      className="mx-auto w-full max-w-[1440px] px-4 pt-5 sm:px-6 lg:px-8"
      aria-label="Banner promocional"
    >
      <div className="relative h-[231px] overflow-hidden rounded-[18px] border border-[#dbe7ff] bg-white shadow-[0_18px_44px_rgba(15,23,42,0.08)] sm:h-[272px] md:h-[308px] lg:h-[332px]">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(37,99,235,0.1)_0%,rgba(255,255,255,0)_45%,rgba(37,99,235,0.06)_100%)]" />

        {normalizedSlides.map((slide, index) => (
          <div
            key={`${slide.image}-${index}`}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === activeIndex
                ? "opacity-100 translate-x-0"
                : "pointer-events-none opacity-0 translate-x-1"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.image}
              alt={slide.alt}
              className="h-full w-full object-cover"
            />
          </div>
        ))}

        <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-3 bg-[linear-gradient(180deg,rgba(15,23,42,0)_0%,rgba(15,23,42,0.42)_100%)] px-3 py-2 sm:px-4 sm:py-3">
          <div className="flex shrink-0 items-center gap-1.5">
            {normalizedSlides.map((slide, index) => (
              <span
                key={`${slide.image}-dot-${index}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === activeIndex
                    ? "w-5 bg-white"
                    : "w-1.5 bg-white/45"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
