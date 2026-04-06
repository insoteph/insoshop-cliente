"use client";

import { useEffect, useMemo, useState } from "react";

import { permissions } from "@/modules/auth/lib/permissions";
import { useAdminSession } from "@/modules/auth/providers/AdminSessionProvider";
import { CategoriesPanel } from "@/modules/categories/components/CategoriesPanel";
import { formatDate } from "@/modules/core/lib/formatters";
import { ProductsPanel } from "@/modules/products/components/ProductsPanel";
import { SalesPanel } from "@/modules/sales/components/SalesPanel";
import { StoreInfoPanel } from "@/modules/tiendas/components/StoreInfoPanel";
import { fetchTiendaById } from "@/modules/tiendas/services/tiendas-service";
import type { TiendaDetalle } from "@/modules/tiendas/types/tiendas-types";

type StoreAdminViewProps = {
  storeId: number;
};

type TabId = "informacion" | "productos" | "categorias" | "ventas";

export function StoreAdminView({ storeId }: StoreAdminViewProps) {
  const { hasPermission, currentUser, activeStoreId, setActiveStoreId } =
    useAdminSession();
  const [store, setStore] = useState<TiendaDetalle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("informacion");

  useEffect(() => {
    if (activeStoreId !== storeId) {
      setActiveStoreId(storeId);
    }
  }, [activeStoreId, setActiveStoreId, storeId]);

  useEffect(() => {
    async function loadStore() {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchTiendaById(storeId);
        setStore(result);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudo cargar la tienda."
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadStore();
  }, [storeId]);

  const tabs = useMemo(() => {
    const availableTabs: Array<{
      id: TabId;
      label: string;
      visible: boolean;
    }> = [
      {
        id: "informacion",
        label: "Información",
        visible: hasPermission(permissions.tiendas.ver),
      },
      {
        id: "productos",
        label: "Productos",
        visible: hasPermission(permissions.productos.ver),
      },
      {
        id: "categorias",
        label: "Categorías",
        visible: hasPermission(permissions.categorias.ver),
      },
      {
        id: "ventas",
        label: "Ventas",
        visible:
          currentUser?.tieneAccesoGlobal ||
          hasPermission(permissions.ventas.ver),
      },
    ];

    return availableTabs.filter((tab) => tab.visible);
  }, [currentUser?.tieneAccesoGlobal, hasPermission]);

  useEffect(() => {
    if (!tabs.some((tab) => tab.id === activeTab)) {
      setActiveTab(tabs[0]?.id ?? "informacion");
    }
  }, [activeTab, tabs]);

  if (isLoading) {
    return (
      <section className="panel-card">
        <p className="text-sm text-[var(--muted)]">
          Cargando administración de tienda...
        </p>
      </section>
    );
  }

  if (error || !store) {
    return (
      <section className="panel-card">
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || "No fue posible cargar la tienda seleccionada."}
        </p>
      </section>
    );
  }

  const canEditStore = hasPermission(permissions.tiendas.editar);
  const canManageProducts =
    hasPermission(permissions.productos.crear) ||
    hasPermission(permissions.productos.editar) ||
    hasPermission(permissions.productos.eliminar);
  const canManageCategories =
    hasPermission(permissions.categorias.crear) ||
    hasPermission(permissions.categorias.editar) ||
    hasPermission(permissions.categorias.eliminar);

  return (
    <section className="space-y-5">
      <div className="overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--panel)] shadow-[var(--shadow)]">
        <div className="grid gap-6 bg-[linear-gradient(135deg,rgba(13,185,129,0.14),rgba(31,94,255,0.18))] px-6 py-8 xl:grid-cols-[minmax(0,1.2fr)_380px]">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              Contexto de tienda
            </p>
            <h2 className="text-3xl font-semibold text-[var(--foreground)]">
              {store.nombre}
            </h2>
            <p className="max-w-2xl text-sm text-[var(--muted)]">
              Gestiona la operación diaria de la tienda, su catálogo, equipo y
              ventas desde una sola vista unificada.
            </p>
          </div>

          <div className="grid gap-3 rounded-[1.75rem] border border-white/45 bg-white/65 p-5 backdrop-blur md:grid-cols-3 xl:grid-cols-1">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                Teléfono
              </p>
              <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                {store.telefono}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                Moneda
              </p>
              <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                {store.moneda}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                Creación
              </p>
              <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                {formatDate(store.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-[1.75rem] border border-[var(--line)] bg-[var(--panel)] p-3 shadow-[var(--shadow)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              activeTab === tab.id
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--panel-muted)] text-[var(--foreground)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "informacion" ? (
        <StoreInfoPanel storeId={storeId} canEdit={canEditStore} />
      ) : null}

      {activeTab === "productos" ? (
        <ProductsPanel
          storeId={storeId}
          canManage={canManageProducts}
          currency={store.moneda}
        />
      ) : null}

      {activeTab === "categorias" ? (
        <CategoriesPanel
          storeId={storeId}
          canManage={canManageCategories}
        />
      ) : null}

      {activeTab === "ventas" ? (
        <SalesPanel storeId={storeId} currency={store.moneda} />
      ) : null}

      {!currentUser?.tieneAccesoGlobal && tabs.length === 0 ? (
        <section className="panel-card">
          <p className="text-sm text-[var(--muted)]">
            No tienes módulos habilitados para esta tienda según tus permisos
            actuales.
          </p>
        </section>
      ) : null}
    </section>
  );
}
