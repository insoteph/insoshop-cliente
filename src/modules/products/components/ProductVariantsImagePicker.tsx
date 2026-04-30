"use client";

import { useCallback, useRef, useState } from "react";

import { uploadProductImage } from "@/modules/products/services/product-service";

type ProductVariantsImagePickerProps = {
  value: string | null;
  onChange: (value: string | null) => void;
  disabled: boolean;
  className?: string;
};

function ImageIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block ${className}`}
      style={{
        WebkitMaskImage: "url(/icons/uploadimg.svg)",
        maskImage: "url(/icons/uploadimg.svg)",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        backgroundColor: "currentColor",
      }}
    />
  );
}

function CloseIcon() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-3.5 w-3.5"
      style={{
        WebkitMaskImage: "url(/icons/cross.svg)",
        maskImage: "url(/icons/cross.svg)",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        backgroundColor: "currentColor",
      }}
    />
  );
}

export function ProductVariantsImagePicker({
  value,
  onChange,
  disabled,
  className = "",
}: ProductVariantsImagePickerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const preview = value?.trim() ? value.trim() : null;

  const openPicker = useCallback(() => {
    if (!disabled && !isUploading) {
      inputRef.current?.click();
    }
  }, [disabled, isUploading]);

  const handleUpload = useCallback(async () => {
    const file = inputRef.current?.files?.[0];
    if (!file) {
      return;
    }

    setIsUploading(true);
    setFeedback(null);

    try {
      const uploaded = await uploadProductImage(file);
      onChange(uploaded.url);
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "No se pudo subir la imagen de la variante.",
      );
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }, [onChange]);

  return (
    <div className={`h-full ${className}`.trim()}>
      <div
        role="button"
        tabIndex={disabled || isUploading ? -1 : 0}
        onClick={openPicker}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openPicker();
          }
        }}
        aria-disabled={disabled || isUploading}
        className={`group relative inline-flex h-[320px] w-full items-center justify-center overflow-hidden rounded-2xl border text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 md:h-11 md:min-h-0 ${
          disabled || isUploading ? "cursor-not-allowed opacity-60" : "cursor-pointer"
        } ${
          preview
            ? "border-[var(--line)] bg-[var(--panel-muted)] px-0 text-[var(--foreground-strong)] hover:border-[var(--line-strong)]"
            : "border-dashed border-[var(--line)] bg-transparent px-4 text-[var(--foreground)] hover:border-[var(--line-strong)] hover:bg-[var(--panel-muted)]"
        }`}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Imagen de la variante"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}

        {preview ? (
          <div className="absolute inset-0 bg-black/10 transition group-hover:bg-black/15" />
        ) : null}

        {preview ? (
          <span className="relative z-10 sr-only">
            {isUploading ? "Subiendo..." : "Cambiar imagen"}
          </span>
        ) : (
          <span className="relative z-10 inline-flex items-center gap-2">
            <span className="text-[var(--accent)]">
              <ImageIcon />
            </span>
            <span className="hidden sm:inline">
              {isUploading ? "Subiendo..." : "Subir"}
            </span>
          </span>
        )}

        {preview ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onChange(null);
            }}
            disabled={disabled || isUploading}
            className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white/90 shadow-sm transition hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:opacity-60"
            aria-label="Quitar imagen"
            title="Quitar imagen"
          >
            <CloseIcon />
          </button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleUpload}
        className="sr-only"
      />

      {feedback ? <p className="text-xs text-red-600">{feedback}</p> : null}
    </div>
  );
}
