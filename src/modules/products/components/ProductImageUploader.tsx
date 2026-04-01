"use client";

import { useRef, useState, type ChangeEvent } from "react";

import {
  uploadProductImage,
  type ProductImagePayload,
} from "@/modules/products/services/product-service";

type ProductImageUploaderProps = {
  value: ProductImagePayload[];
  onChange: (images: ProductImagePayload[]) => void;
};

export function ProductImageUploader({
  value,
  onChange,
}: ProductImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (!files.length) {
      return;
    }

    setIsUploading(true);
    setFeedback(null);

    try {
      const uploaded = await Promise.all(files.map(uploadProductImage));
      const merged = [...value];

      uploaded.forEach((image) => {
        merged.push({
          url: image.url,
          orden: merged.length,
          esPrincipal: merged.length === 0,
        });
      });

      onChange(merged);
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "No se pudieron subir las imágenes."
      );
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function removeImage(indexToRemove: number) {
    const nextImages = value
      .filter((_, index) => index !== indexToRemove)
      .map((image, index) => ({
        ...image,
        orden: index,
        esPrincipal: index === 0 ? true : image.esPrincipal,
      }));

    if (nextImages.length && !nextImages.some((image) => image.esPrincipal)) {
      nextImages[0].esPrincipal = true;
    }

    onChange(nextImages);
  }

  function setPrimary(indexToPromote: number) {
    onChange(
      value.map((image, index) => ({
        ...image,
        orden: index,
        esPrincipal: index === indexToPromote,
      }))
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--panel-muted)] p-5">
        <p className="text-sm font-medium text-[var(--foreground)]">
          Sube al menos 3 imágenes por producto.
        </p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Las imágenes se almacenan en S3 y el producto guarda únicamente sus
          URLs públicas.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          onChange={handleFiles}
          className="mt-4 block w-full text-sm text-[var(--muted)]"
        />
        {feedback ? <p className="mt-3 text-sm text-red-600">{feedback}</p> : null}
        {isUploading ? (
          <p className="mt-3 text-sm text-[var(--muted)]">Subiendo imágenes...</p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {value.map((image, index) => (
          <div key={image.url} className="panel-card p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.url}
              alt={`Imagen ${index + 1}`}
              className="h-44 w-full rounded-2xl object-cover"
            />
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className="rounded-xl border border-[var(--line)] px-3 py-2 text-xs font-semibold text-[var(--foreground)]"
                onClick={() => setPrimary(index)}
              >
                {image.esPrincipal ? "Principal" : "Marcar principal"}
              </button>
              <button
                type="button"
                className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600"
                onClick={() => removeImage(index)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
