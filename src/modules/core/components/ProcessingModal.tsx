"use client";

type ProcessingModalProps = {
  isOpen: boolean;
  label?: string;
};

export function ProcessingModal({
  isOpen,
  label = "Procesando...",
}: ProcessingModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <div className="app-card pointer-events-auto w-[min(92vw,18rem)] rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <span
            className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-[color-mix(in_srgb,var(--accent)_20%,transparent)] border-t-[var(--accent)]"
            aria-hidden="true"
          />
          <p className="text-sm font-semibold text-[var(--foreground-strong)]">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}
