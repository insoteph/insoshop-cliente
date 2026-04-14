import { useEffect } from "react";

type CartFeedbackModalProps = {
  show: boolean;
  type: "success" | "cancel";
  onClose: () => void;
};

// Definimos una animación simple de Fade In directamente aquí si no tienes configurado
// tailwind.config.js para animaciones custom. Si lo tienes, usa tu propia clase.
// Pero la forma más directa sin tocar configuración es usar una clase de opacidad con delay.

export default function CartFeedbackModal({
  show,
  type,
  onClose,
}: CartFeedbackModalProps) {
  useEffect(() => {
    if (show) {
      // Un segundo y medio es perfecto para leer y procesar
      const timer = setTimeout(() => {
        onClose();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const isSuccess = type === "success";

  const icon = isSuccess ? "/icons/check-cart.svg" : "/icons/cancel-cart.svg";
  // Mensajes más cortos para un modal tipo "toast"
  const message = isSuccess ? "Producto agregado" : "Error al agregar";

  return (
    // Overlay con blur muy suave
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/10 backdrop-blur-[1px]">
      {}
      <div
        className={`
          relative bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-2xl 
          flex flex-col items-center gap-3 min-w-[220px] 
          border border-slate-100/50 text-center 
        `}
        style={{
          animation: "fadeInScale 0.3s ease-out forwards",
        }}
      >
        {}
        <style>{`
          @keyframes fadeInScale {
            0% { opacity: 0; transform: scale(0.9) translateY(10px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        {}
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center ${isSuccess ? "bg-emerald-50" : "bg-red-50"}`}
        >
          <img src={icon} alt={type} className="w-8 h-8 object-contain" />
        </div>

        <p
          className={`text-sm font-semibold ${isSuccess ? "text-emerald-700" : "text-red-700"}`}
        >
          {message}
        </p>
      </div>
    </div>
  );
}
