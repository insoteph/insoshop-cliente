"use client";

import Link from "next/link";

type StoreCatalogFooterProps = {
  storeName?: string;
  slug?: string;
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
  slug,
  phone,
}: StoreCatalogFooterProps) {
  return (
    <footer className="w-full border-t border-[#eceff7] bg-white">
      <div className="w-full px-4 py-10 md:px-8 lg:px-12 lg:py-12">
        <div className="grid gap-10 xl:grid-cols-[minmax(240px,0.9fr)_minmax(0,1fr)]">
          <div className="space-y-5">
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8b93af]">
                {storeName ?? "InsoShop"}
              </p>
              <div>
                <p className="text-lg font-semibold uppercase tracking-[0.18em] text-[#191d2d]">
                  Insoteph
                </p>
                <p className="text-xs uppercase tracking-[0.3em] text-[#9ca3bc]">
                  Technology Company
                </p>
              </div>
              <p className="max-w-sm text-sm leading-7 text-[#66708c]">
                Plataforma desarrollada por Insoteph para administrar catalogos,
                pedidos y operaciones comerciales desde un mismo entorno.
              </p>
            </div>

            <div className="space-y-2 text-sm text-[#66708c]">
              <p>contacto@insoteph.com</p>
              <p>+504 9317-3894</p>
              <p>{phone?.trim() ? `Tienda: ${phone}` : "Santa Rosa de Copan, Honduras"}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              {slug ? (
                <Link
                  href={`/${encodeURIComponent(slug)}`}
                  className="inline-flex items-center rounded-full border border-[#e5e9f4] bg-[#f7f8fd] px-4 py-2 text-sm font-semibold text-[#202540] hover:border-[#d5dbed]"
                >
                  Volver al catalogo
                </Link>
              ) : null}
              <a
                href={INSOTEPH_CHANNELS.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-full bg-[#6d38ff] px-4 py-2 text-sm font-semibold text-white shadow-[0_16px_26px_rgba(109,56,255,0.18)]"
              >
                Sitio de Insoteph
              </a>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {footerColumns.map((column) => (
              <div key={column.title} className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7f88a4]">
                  {column.title}
                </p>
                <div className="space-y-2 text-sm text-[#626c88]">
                  {column.links.map((link) =>
                    link.href ? (
                      <a
                        key={`${column.title}-${link.label}`}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="block transition hover:text-[#191d2d]"
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
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7f88a4]">
                Follow Us
              </p>
              <p className="text-sm leading-6 text-[#626c88]">
                Canales oficiales de Insoteph para soporte y seguimiento.
              </p>
              <div className="flex items-center gap-3">
                <a
                  href={INSOTEPH_CHANNELS.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#e4e8f3] text-xs font-bold text-[#202540] hover:border-[#cfd6ea]"
                  aria-label="Sitio web de Insoteph"
                >
                  W
                </a>
                <a
                  href={INSOTEPH_CHANNELS.email}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#e4e8f3] text-xs font-bold text-[#202540] hover:border-[#cfd6ea]"
                  aria-label="Correo de Insoteph"
                >
                  @
                </a>
                <a
                  href={INSOTEPH_CHANNELS.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#e4e8f3] text-xs font-bold text-[#202540] hover:border-[#cfd6ea]"
                  aria-label="WhatsApp de Insoteph"
                >
                  WA
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
