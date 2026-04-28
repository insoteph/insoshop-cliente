"use client";

import Image from "next/image";

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
      className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/95 shadow-[0_18px_34px_rgba(25,29,45,0.2)] ring-1 ring-[#dbe2f1] transition-transform hover:scale-105 hover:shadow-[0_22px_40px_rgba(25,29,45,0.24)]"
      aria-label="Contactar por WhatsApp"
      title="Contactar por WhatsApp"
    >
      <span className="block h-10 w-10 overflow-hidden rounded-full bg-white">
        <Image
          src="/assets/whatsapp_icon.png"
          alt="WhatsApp"
          width={40}
          height={40}
          className="h-full w-full rounded-full object-cover"
        />
      </span>
    </a>
  );
}
