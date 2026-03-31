"use client";

import Link from "next/link";

import { useStoreContext } from "@/modules/stores/context/StoreContext";

const cards = [
  {
    title: "Tiendas",
    description: "Selecciona la tienda activa y cambia de contexto sin recargar.",
    href: "/dashboard/tiendas",
  },
  {
    title: "Productos",
    description: "Crea productos con múltiples imágenes y guarda solo URLs.",
    href: "/dashboard/productos",
  },
  {
    title: "Ventas",
    description: "Registra ventas y detalle en una sola transacción.",
    href: "/dashboard/ventas",
  },
];

export default function DashboardPage() {
  const { activeStore } = useStoreContext();

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className="panel-card">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              Acceso rápido
            </p>
            <h2 className="mt-3 text-xl font-semibold text-[var(--foreground)]">
              {card.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {card.description}
            </p>
          </Link>
        ))}
      </div>

      <div className="panel-card">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          Contexto actual
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
          {activeStore ? activeStore.nombre : "Sin tienda activa"}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
          El header `X-Tienda-Id` se enviará usando la tienda seleccionada para
          filtrar productos, categorías y ventas sin mezclar lógica de negocio
          en los componentes de UI.
        </p>
      </div>
    </section>
  );
}
