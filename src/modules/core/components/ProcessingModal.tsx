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
      {/* El modal en sí mismo con fondo sólido o semi-sólido para que no se pierda el texto */}
      <div className="pointer-events-auto w-[min(92vw,18rem)] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl ">
        <div className="flex items-center gap-3">
          <span
            className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-blue-600/20 border-t-blue-600"
            aria-hidden="true"
          />
          <p className="text-sm font-semibold text-slate-900">{label}</p>
        </div>
      </div>
    </div>
  );
}
