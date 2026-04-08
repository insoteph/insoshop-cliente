"use client";

type FloatingWhatsAppButtonProps = {
  phone: string | null | undefined;
};

export function FloatingWhatsAppButton({ phone }: FloatingWhatsAppButtonProps) {
  const digitsOnly = (phone ?? "").replace(/\D+/g, "");

  if (!digitsOnly) {
    return null;
  }

  return (
    <a
      href={`https://wa.me/${digitsOnly}`}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full border border-[#1f9c59] bg-[#25d366] text-white shadow-xl transition-transform hover:scale-105"
      aria-label="Contactar por WhatsApp"
      title="Contactar por WhatsApp"
    >
      WA
    </a>
  );
}
