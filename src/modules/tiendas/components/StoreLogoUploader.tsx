"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";

import { AppButton } from "@/modules/core/components/AppButton";
import {
  deleteTiendaLogo,
  uploadTiendaLogo,
} from "@/modules/tiendas/services/tiendas-service";

type StoreLogoUploaderProps = {
  storeId: number;
  currentLogoUrl: string;
  disabled?: boolean;
  onUploaded?: (logoUrl: string) => void;
  onDeleted?: () => void;
};

export function StoreLogoUploader({
  storeId,
  currentLogoUrl,
  disabled = false,
  onUploaded,
  onDeleted,
}: StoreLogoUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(currentLogoUrl);
  const [hasPersistedLogo, setHasPersistedLogo] = useState<boolean>(
    Boolean(currentLogoUrl),
  );
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  useEffect(() => {
    setPreviewUrl(currentLogoUrl);
    setHasPersistedLogo(Boolean(currentLogoUrl));
  }, [currentLogoUrl]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    objectUrlRef.current = URL.createObjectURL(file);
    setPreviewUrl(objectUrlRef.current);
    setErrorMessage(null);
    void handleUploadWithFile(file);
  }

  async function handleUploadWithFile(file: File) {
    setIsUploading(true);
    setErrorMessage(null);

    try {
      const result = await uploadTiendaLogo(storeId, file);
      setPreviewUrl(result.data.logoUrl);
      setHasPersistedLogo(true);
      onUploaded?.(result.data.logoUrl);

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el logo.",
      );
      setPreviewUrl(currentLogoUrl);
      setHasPersistedLogo(Boolean(currentLogoUrl));
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    } finally {
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      setIsUploading(false);
    }
  }

  async function handleDelete() {
    setIsUploading(true);
    setErrorMessage(null);

    try {
      await deleteTiendaLogo(storeId);
      setPreviewUrl("");
      setHasPersistedLogo(false);
      onDeleted?.();

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar el logo.",
      );
    } finally {
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      setIsUploading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-4 sm:flex-row">
      <div className="flex h-40 w-40 shrink-0 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,color-mix(in_srgb,var(--panel-muted)_88%,white_12%)_0%,color-mix(in_srgb,var(--accent-soft)_50%,var(--panel)_50%)_100%)]">
        <div className="flex h-full w-full items-center justify-center p-3">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Logo de la tienda"
              className="h-full w-full rounded-2xl object-contain shadow-[0_16px_34px_rgba(15,23,42,0.12)]"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-2xl bg-[var(--panel)] px-4 py-4 text-center text-xs text-[var(--muted)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--panel-muted)] text-[var(--accent)]">
                <span className="text-3xl">🖼</span>
              </div>
              <p className="max-w-[10rem] text-sm font-medium text-[var(--foreground-strong)]">
                Sube el logotipo de tu negocio
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <AppButton
            iconPath="/icons/uploadimg.svg"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || isUploading}
          >
            Elegir imagen
          </AppButton>
        </div>
        {hasPersistedLogo ? (
          <AppButton
            iconPath="/icons/trash.svg"
            onClick={handleDelete}
            disabled={disabled || isUploading}
            variant="danger"
          >
            {isUploading ? "Eliminando..." : "Eliminar imagen"}
          </AppButton>
        ) : null}
        {errorMessage ? (
          <p className="text-sm text-red-600">{errorMessage}</p>
        ) : null}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileChange}
          className="sr-only"
        />
      </div>
    </div>
  );
}
