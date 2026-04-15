import Image from "next/image";
import { useEffect } from "react";

type CartFeedbackModalProps = {
  show: boolean;
  type: "success" | "cancel";
  onClose: () => void;
};

const AUTO_CLOSE_MS = 1500;

export default function CartFeedbackModal({
  show,
  type,
  onClose,
}: CartFeedbackModalProps) {
  useEffect(() => {
    if (!show) {
      return;
    }

    const timer = window.setTimeout(() => {
      onClose();
    }, AUTO_CLOSE_MS);

    return () => window.clearTimeout(timer);
  }, [show, onClose]);

  if (!show) {
    return null;
  }

  const isSuccess = type === "success";
  const icon = isSuccess ? "/icons/check-cart.svg" : "/icons/cancel-cart.svg";
  const badgeClasses = isSuccess
    ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
    : "bg-rose-50 text-rose-700 ring-rose-100";
  const title = isSuccess ? "Producto agregado" : "No se pudo agregar";
  const description = isSuccess
    ? "El producto ya está disponible en tu carrito."
    : "Intenta nuevamente en unos segundos.";

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-4 sm:inset-0 sm:items-center sm:px-4 sm:pb-4"
      aria-live="polite"
      aria-atomic="true"
      role="status"
    >
      <div
        className="pointer-events-auto w-full max-w-sm animate-[cart-feedback-enter_220ms_ease-out] rounded-[1.75rem] border border-white/50 bg-white/92 p-4 shadow-[0_20px_48px_rgba(15,23,42,0.18)] backdrop-blur-xl sm:max-w-md sm:p-5"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ring-1 ${badgeClasses} sm:h-16 sm:w-16`}
          >
            <Image
              src={icon}
              alt={title}
              width={30}
              height={30}
              className="h-7 w-7 object-contain sm:h-8 sm:w-8"
            />
          </div>

          <div className="min-w-0 flex-1">
            <p
              className={`text-sm font-semibold sm:text-base ${
                isSuccess ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {title}
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
              {description}
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes cart-feedback-enter {
          0% {
            opacity: 0;
            transform: translateY(18px) scale(0.96);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (min-width: 640px) {
          @keyframes cart-feedback-enter {
            0% {
              opacity: 0;
              transform: translateY(10px) scale(0.96);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        }
      `}</style>
    </div>
  );
}
