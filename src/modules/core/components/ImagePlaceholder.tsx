"use client";

type ImagePlaceholderProps = {
  size?: number;
  className?: string;
  iconPath?: string;
  iconClassName?: string;
};

export function ImagePlaceholder({
  size = 44,
  className = "",
  iconPath = "/icons/no-image.svg",
  iconClassName = "h-5 w-5",
}: ImagePlaceholderProps) {
  return (
    <div
      aria-hidden="true"
      className={`inline-flex items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--panel-muted)] ${className}`}
      style={{ width: size, height: size }}
    >
      <span
        className={`inline-block bg-[var(--muted)] ${iconClassName}`}
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
