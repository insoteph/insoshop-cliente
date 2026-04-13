"use client";

import Image from "next/image";

type StoreCatalogFooterProps = {
  storeName?: string;
  phone?: string | null;
};

const INSOTEPH_CHANNELS = {
  website: "https://www.insoteph.com",
  whatsapp: "https://wa.me/50493173894",
  email: "mailto:contacto@insoteph.com",
};

const footerColumns = [
  {
    title: "Shop",
    links: [
      { label: "Catalogo", href: null },
      { label: "Productos", href: null },
      { label: "Carrito", href: null },
      { label: "Soporte", href: INSOTEPH_CHANNELS.website },
    ],
  },
  {
    title: "Ayuda",
    links: [
      { label: "Preguntas", href: INSOTEPH_CHANNELS.website },
      { label: "Pagos", href: INSOTEPH_CHANNELS.whatsapp },
      { label: "Envios", href: INSOTEPH_CHANNELS.whatsapp },
      { label: "Contacto", href: INSOTEPH_CHANNELS.email },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Insoteph", href: INSOTEPH_CHANNELS.website },
      { label: "Servicios", href: `${INSOTEPH_CHANNELS.website}/#servicios` },
      { label: "Nosotros", href: `${INSOTEPH_CHANNELS.website}/#nosotros` },
      { label: "Contacto", href: `${INSOTEPH_CHANNELS.website}/contacto` },
    ],
  },
];

export function StoreCatalogFooter({
  storeName,
  phone,
}: StoreCatalogFooterProps) {
  return (
    <footer className="w-full border-t border-[var(--line)] bg-[var(--panel-strong)]">
      <div className="w-full px-4 py-10 md:px-8 lg:px-12 lg:py-12">
        <div className="grid gap-10 xl:grid-cols-[minmax(240px,0.9fr)_minmax(0,1fr)]">
          <div className="space-y-5">
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
                {storeName ?? "InsoShop"}
              </p>
              <div>
                <p className="text-lg font-semibold uppercase tracking-[0.18em] text-[var(--foreground-strong)]">
                  Insoteph
                </p>
              </div>
              <p className="max-w-sm text-sm leading-7 text-[var(--muted)]">
                Plataforma desarrollada por Insoteph para administrar catalogos,
                pedidos y operaciones comerciales desde un mismo entorno.
              </p>
            </div>

            <div className="space-y-2 text-sm text-[var(--muted)]">
              <p>contacto@insoteph.com</p>
              <p>+504 9317-3894</p>
              <p>{phone?.trim() ? `Tienda: ${phone}` : "Santa Rosa de Copan, Honduras"}</p>
            </div>

          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {footerColumns.map((column) => (
              <div key={column.title} className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                  {column.title}
                </p>
                <div className="space-y-2 text-sm text-[var(--muted)]">
                  {column.links.map((link) =>
                    link.href ? (
                      <a
                        key={`${column.title}-${link.label}`}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="block transition hover:text-[var(--foreground-strong)]"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <span
                        key={`${column.title}-${link.label}`}
                        className="block"
                      >
                        {link.label}
                      </span>
                    ),
                  )}
                </div>
              </div>
            ))}

            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                Follow Us
              </p>
              <p className="text-sm leading-6 text-[var(--muted)]">
                Canales oficiales de Insoteph para soporte y seguimiento.
              </p>
              <div className="flex items-center gap-3">
                <a
                  href={INSOTEPH_CHANNELS.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] text-xs font-bold text-[var(--foreground)] hover:border-[var(--line-strong)]"
                  aria-label="Sitio web de Insoteph"
                >
                  W
                </a>
                <a
                  href={INSOTEPH_CHANNELS.email}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] text-xs font-bold text-[var(--foreground)] hover:border-[var(--line-strong)]"
                  aria-label="Correo de Insoteph"
                >
                  @
                </a>
                <a
                  href={INSOTEPH_CHANNELS.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[var(--panel-muted)] shadow-[0_6px_14px_rgba(30,40,72,0.12)] ring-1 ring-[var(--line)] transition hover:bg-[var(--panel-strong)] hover:shadow-[0_10px_18px_rgba(30,40,72,0.16)]"
                  aria-label="WhatsApp de Insoteph"
                >
                  <Image
                    src="/assets/whatsapp_icon.png"
                    alt="WhatsApp"
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
