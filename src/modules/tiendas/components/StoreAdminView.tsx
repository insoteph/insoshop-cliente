"use client";

import { useEffect, useMemo, useState } from "react";

import { permissions } from "@/modules/auth/lib/permissions";
import { useAdminSession } from "@/modules/auth/providers/AdminSessionProvider";
import { CategoriesPanel } from "@/modules/categories/components/CategoriesPanel";
import {
  StoreModuleTabs,
  type StoreModuleTabId,
} from "@/modules/core/components/StoreModuleTabs";
import { TitleBar } from "@/modules/core/components/TitleBar";
import { ProductsPanel } from "@/modules/products/components/ProductsPanel";
import { SalesPanel } from "@/modules/sales/components/SalesPanel";
import { StoreInfoPanel } from "@/modules/tiendas/components/StoreInfoPanel";
import { fetchTiendaById } from "@/modules/tiendas/services/tiendas-service";
import type { TiendaDetalle } from "@/modules/tiendas/types/tiendas-types";

type StoreAdminViewProps = {
  storeId: number;
};

export function StoreAdminView({ storeId }: StoreAdminViewProps) {
  const { hasPermission, currentUser, activeStoreId, setActiveStoreId } =
    useAdminSession();
  const [store, setStore] = useState<TiendaDetalle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<StoreModuleTabId>("informacion");

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
            : "No se pudo cargar la tienda.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadStore();
  }, [storeId]);

  const visibleTabs = useMemo<StoreModuleTabId[]>(() => {
    const availableTabs: Array<{
      id: StoreModuleTabId;
      visible: boolean;
    }> = [
      {
        id: "informacion",
        visible: hasPermission(permissions.tiendas.ver),
      },
      {
        id: "productos",
        visible: hasPermission(permissions.productos.ver),
      },
      {
        id: "categorias",
        visible: hasPermission(permissions.categorias.ver),
      },
      {
        id: "ventas",
        visible:
          currentUser?.tieneAccesoGlobal ||
          hasPermission(permissions.ventas.ver),
      },
    ];

    return availableTabs.filter((tab) => tab.visible).map((tab) => tab.id);
  }, [currentUser?.tieneAccesoGlobal, hasPermission]);

  useEffect(() => {
    if (!visibleTabs.includes(activeTab)) {
      setActiveTab(visibleTabs[0] ?? "informacion");
    }
  }, [activeTab, visibleTabs]);

  if (isLoading) {
    return (
      <section className="panel-card">
        <p className="text-sm text-[var(--muted)]">
          Cargando administraci\u00f3n de tienda...
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
      <TitleBar title={store.nombre} status={store.estado} />

      <div className="space-y-0">
        <StoreModuleTabs
          visibleTabs={visibleTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="rounded-b-none border-b-0"
        />

        <div className="rounded-b-md border border-[var(--line)] bg-[var(--panel)] p-4 shadow-lg">
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
            <CategoriesPanel storeId={storeId} canManage={canManageCategories} />
          ) : null}

          {activeTab === "ventas" ? (
            <SalesPanel storeId={storeId} currency={store.moneda} />
          ) : null}
        </div>
      </div>

      {!currentUser?.tieneAccesoGlobal && visibleTabs.length === 0 ? (
        <section className="panel-card">
          <p className="text-sm text-[var(--muted)]">
            No tienes m\u00f3dulos habilitados para esta tienda seg\u00fan tus
            permisos actuales.
          </p>
        </section>
      ) : null}
    </section>
  );
}
