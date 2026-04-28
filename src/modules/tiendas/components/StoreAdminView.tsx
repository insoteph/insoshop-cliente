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
import { StoreSettingsPanel } from "@/modules/settings/components/StoreSettingsPanel";
import { StoreInfoPanel } from "@/modules/tiendas/components/StoreInfoPanel";
import { StoreUsersTabPanel } from "@/modules/tiendas/components/StoreUsersTabPanel";
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
      {
        id: "usuarios",
        visible:
          hasPermission(permissions.tiendas.verUsuarios) &&
          (currentUser?.tieneAccesoGlobal ||
            Boolean(
              currentUser?.tiendas.some((tienda) => tienda.id === storeId),
            )),
      },
      {
        id: "configuraciones",
        visible: hasPermission(permissions.metodosPago.ver),
      },
    ];

    return availableTabs.filter((tab) => tab.visible).map((tab) => tab.id);
  }, [
    currentUser?.tiendas,
    currentUser?.tieneAccesoGlobal,
    hasPermission,
    storeId,
  ]);

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
        <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
          {error || "No fue posible cargar la tienda seleccionada."}
        </p>
      </section>
    );
  }

  const canEditStore = hasPermission(permissions.tiendas.editar);
  const canCreateProducts = hasPermission(permissions.productos.crear);
  const canEditProducts = hasPermission(permissions.productos.editar);
  const canDeleteProducts = hasPermission(permissions.productos.eliminar);
  const canManageCategories =
    hasPermission(permissions.categorias.crear) ||
    hasPermission(permissions.categorias.editar) ||
    hasPermission(permissions.categorias.eliminar);

  function handleOpenPublicStore() {
    if (!store?.slug) {
      return;
    }

    window.open(`/${store.slug}`, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="space-y-5">
      <TitleBar
        title={store.nombre}
        status={store.estado}
        actions={
          store.slug ? (
            <button
              type="button"
              className="app-button-secondary rounded-xl px-4 py-2.5 text-sm font-semibold"
              onClick={handleOpenPublicStore}
              title={`Ir a la tienda publica ${store.nombre}`}
            >
              Ver tienda
            </button>
          ) : null
        }
      />

      <div className="mb-3 flex min-h-[calc(100dvh-14rem)] flex-col space-y-0 md:min-h-[calc(100dvh-15rem)]">
        <StoreModuleTabs
          visibleTabs={visibleTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="rounded-b-none border-b-0"
        />

        <div className="app-card flex-1 rounded-b-2xl border p-4">
          {activeTab === "informacion" ? (
            <StoreInfoPanel storeId={storeId} canEdit={canEditStore} />
          ) : null}

          {activeTab === "productos" ? (
            <ProductsPanel
              storeId={storeId}
              canCreateProducts={canCreateProducts}
              canEditProducts={canEditProducts}
              canDeleteProducts={canDeleteProducts}
              canEditAttributes={canEditProducts}
              canDeleteAttributes={canDeleteProducts}
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

          {activeTab === "usuarios" ? (
            <StoreUsersTabPanel storeId={storeId} />
          ) : null}

          {activeTab === "configuraciones" ? (
            <StoreSettingsPanel
              storeId={storeId}
              hasGlobalAccess={Boolean(currentUser?.tieneAccesoGlobal)}
              canCreatePaymentMethods={hasPermission(
                permissions.metodosPago.crear,
              )}
              canEditPaymentMethods={hasPermission(
                permissions.metodosPago.editar,
              )}
              canTogglePaymentMethods={hasPermission(
                permissions.metodosPago.cambiarEstado,
              )}
            />
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
