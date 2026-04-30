"use client";

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
  return (
    <div
      aria-hidden="true"
      className={className}
      style={{ width: size, height: size }}
    >
      <span
        className={`inline-block bg-[var(--muted)] ${iconClassName}`}
        style={{
          WebkitMaskImage: "url(/icons/no-image.svg)",
          maskImage: "url(/icons/no-image.svg)",
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
