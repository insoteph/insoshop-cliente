"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { useAdminSession } from "@/modules/auth/providers/AdminSessionProvider";
import { permissions } from "@/modules/auth/lib/permissions";
import { ProductEditorHeader } from "@/modules/products/components/ProductEditorHeader";
import { ProductFormPanel } from "@/modules/products/components/ProductFormPanel";
import { useProductEditor } from "@/modules/products/hooks/useProductEditor";
import { buildProductsListPath } from "@/modules/products/lib/product-routing";

type ProductEditorViewProps = {
  mode: "create" | "edit";
  productId?: number;
};

export function ProductEditorView({ mode, productId }: ProductEditorViewProps) {
  const router = useRouter();
  const { activeStoreId, hostStoreId, isLoading: isSessionLoading, hasPermission } =
    useAdminSession();

  const resolvedStoreId = hostStoreId ?? activeStoreId ?? null;
  const canCreateProducts = hasPermission(permissions.productos.crear);
  const canEditProducts = hasPermission(permissions.productos.editar);
  const canDeleteProducts = hasPermission(permissions.productos.eliminar);
  const canEditAttributes = canEditProducts;
  const canDeleteAttributes = canDeleteProducts;
  const canAccessForm =
    mode === "create"
      ? canCreateProducts && canEditProducts
      : canEditProducts;

  const returnToList = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.replace(buildProductsListPath());
  };

  const {
    categories,
    product,
    isLoading,
    isSaving,
    error,
    formError,
    editingProductId,
    form,
    setForm,
    handleSubmit,
  } = useProductEditor({
    storeId: resolvedStoreId ?? 0,
    mode,
    productId,
    onSaved: returnToList,
  });

  const pageTitle = useMemo(() => {
    if (mode === "create") {
      return "Nuevo producto";
    }

    return product?.nombre ?? "Editar producto";
  }, [mode, product?.nombre]);

  if (isSessionLoading) {
    return (
      <section className="panel-card">
        <p className="text-sm text-[var(--muted)]">Cargando contexto de tienda...</p>
      </section>
    );
  }

  if (!resolvedStoreId) {
    return (
      <section className="panel-card">
        <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
          No se pudo resolver la tienda activa para editar productos.
        </p>
      </section>
    );
  }

  if (!canAccessForm) {
    return (
      <section className="panel-card">
        <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
          No tienes permisos para crear o editar productos en esta tienda.
        </p>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="space-y-4">
        <ProductEditorHeader title={pageTitle} onBack={returnToList} />
        <div className="panel-card">
          <p className="text-sm text-[var(--muted)]">
            Cargando formulario del producto...
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-4">
        <ProductEditorHeader title={pageTitle} onBack={returnToList} />
        <div className="panel-card">
          <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <ProductEditorHeader title={pageTitle} onBack={returnToList} />

      <ProductFormPanel
        storeId={resolvedStoreId}
        isVisible
        editingProductId={editingProductId}
        isSaving={isSaving}
        formError={formError}
        form={form}
        categories={categories}
        canCreateProducts={canCreateProducts}
        canEditProducts={canEditProducts}
        canDeleteProducts={canDeleteProducts}
        canEditAttributes={canEditAttributes}
        canDeleteAttributes={canDeleteAttributes}
        submitLabel={mode === "create" ? "Crear producto" : "Guardar cambios"}
        onSubmit={handleSubmit}
        onNombreChange={(value) =>
          setForm((current) => ({
            ...current,
            nombre: value,
          }))
        }
        onCategoriaChange={(value) =>
          setForm((current) => ({
            ...current,
            categoriaId: value,
          }))
        }
        onDescripcionChange={(value) =>
          setForm((current) => ({
            ...current,
            descripcion: value,
          }))
        }
        onAtributosChange={(value) =>
          setForm((current) => ({
            ...current,
            atributos: value,
          }))
        }
        onVariantesChange={(value) =>
          setForm((current) => ({
            ...current,
            variantes: value,
          }))
        }
      />
    </section>
  );
}
