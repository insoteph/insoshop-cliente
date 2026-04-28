"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  DataTable,
  type DataTableBadgeConfig,
  type DataTableColumn,
  type DataTableRowActionsConfig,
} from "@/modules/core/components/DataTable";
import {
  DataTableToolbar,
  ToolbarActions,
  type DataTableToolbarAction,
} from "@/modules/core/components/DataTableToolbar";
import { SearchBar } from "@/modules/core/components/SearchBar";
import { useConfirmationDialog } from "@/modules/core/providers/ConfirmationDialogProvider";
import { useToast } from "@/modules/core/providers/ToastProvider";
import { formatDate } from "@/modules/core/lib/formatters";
import {
  fetchTiendas,
  createTienda,
  toggleTiendaStatus,
} from "@/modules/tiendas/services/tiendas-service";
import {
  StoreCreateFormPanel,
  type StoreCreateFormState,
} from "@/modules/tiendas/components/StoreCreateFormPanel";
import type { Tienda } from "@/modules/tiendas/types/tiendas-types";

const INITIAL_CREATE_FORM: StoreCreateFormState = {
  nombre: "",
  codigoPais: "+504",
  numeroTelefono: "",
  moneda: "L",
  logoUrl: "",
  estado: true,
};
const FORM_ANIMATION_MS = 500;

export function StoreDirectoryView() {
  const router = useRouter();
  const { confirm } = useConfirmationDialog();
  const toast = useToast();
  const [stores, setStores] = useState<Tienda[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createFormError, setCreateFormError] = useState<string | null>(null);
  const [createForm, setCreateForm] =
    useState<StoreCreateFormState>(INITIAL_CREATE_FORM);
  const [isCreateFormMounted, setIsCreateFormMounted] = useState(false);
  const [isCreateFormVisible, setIsCreateFormVisible] = useState(false);
  const closeCreateFormTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  const loadStores = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchTiendas({
        page,
        pageSize,
        search: debouncedSearch,
        estadoFiltro: "todos",
      });

      setStores(result.items);
      setTotalPages(result.totalPages);
      setTotalRecords(result.totalRecords);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudo cargar el listado de tiendas.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, page, pageSize]);

  useEffect(() => {
    void loadStores();
  }, [loadStores]);

  const resetCreateForm = useCallback(() => {
    setCreateForm(INITIAL_CREATE_FORM);
    setCreateFormError(null);
  }, []);

  const clearCloseCreateFormTimeout = useCallback(() => {
    if (closeCreateFormTimeoutRef.current) {
      window.clearTimeout(closeCreateFormTimeoutRef.current);
      closeCreateFormTimeoutRef.current = null;
    }
  }, []);

  const openCreateFormPanel = useCallback(() => {
    clearCloseCreateFormTimeout();
    setIsCreateFormMounted(true);
    window.requestAnimationFrame(() => {
      setIsCreateFormVisible(true);
    });
  }, [clearCloseCreateFormTimeout]);

  const closeCreateFormPanel = useCallback(
    (shouldReset = true) => {
      setIsCreateFormVisible(false);
      clearCloseCreateFormTimeout();
      closeCreateFormTimeoutRef.current = window.setTimeout(() => {
        setIsCreateFormMounted(false);
        if (shouldReset) {
          resetCreateForm();
        }
      }, FORM_ANIMATION_MS);
    },
    [clearCloseCreateFormTimeout, resetCreateForm],
  );

  useEffect(() => {
    return () => {
      clearCloseCreateFormTimeout();
    };
  }, [clearCloseCreateFormTimeout]);

  const handleToggleStoreStatus = useCallback(
    async (store: Tienda) => {
      const action = store.estado ? "inactivar" : "activar";
      const shouldContinue = await confirm({
        title: "Confirmar accion",
        description: `Deseas ${action} la tienda ${store.nombre}?`,
        confirmLabel: store.estado ? "Inactivar" : "Activar",
        variant: store.estado ? "danger" : "primary",
      });
      if (!shouldContinue) {
        return;
      }

      try {
        await toggleTiendaStatus(store.id, {
          nombre: store.nombre,
          telefono: store.telefono,
          moneda: store.moneda,
          logoUrl: store.logoUrl,
          estado: store.estado,
        });
        await loadStores();
        toast.success(
          store.estado
            ? "Tienda inactivada correctamente."
            : "Tienda activada correctamente.",
          "Tienda",
        );
      } catch (toggleError) {
        setError(
          toggleError instanceof Error
            ? toggleError.message
            : "No se pudo actualizar el estado de la tienda.",
        );
      }
    },
    [confirm, loadStores, toast],
  );

  const columns = useMemo<DataTableColumn<Tienda>[]>(
    () => [
      {
        key: "logoUrl",
        header: "Logo",
        dataType: "image",
        imageConfig: {
          alt: (store) => `Logo de ${store.nombre}`,
          width: 48,
          height: 48,
          className: "rounded-2xl",
          fallbackText: "Sin logo",
        },
      },
      {
        key: "nombre",
        header: "Tienda",
        className: "font-semibold",
      },
      {
        key: "slug",
        header: "Slug",
        textFormatter: (value) => `/${String(value ?? "")}`,
      },
      {
        key: "telefono",
        header: "Telefono",
      },
      {
        key: "createdAt",
        header: "Creacion",
        textFormatter: (value) => formatDate(String(value ?? "")),
      },
      {
        key: "estado",
        header: "Estado",
      },
    ],
    [],
  );

  const badges = useMemo<Array<DataTableBadgeConfig<Tienda>>>(
    () => [
      {
        columnKey: "estado",
        rules: [
          {
            value: true,
            label: "Activo",
            iconPath: "/icons/check.svg",
            textClassName: "app-badge-success",
            backgroundClassName: "",
          },
          {
            value: false,
            label: "Inactivo",
            iconPath: "/icons/cross.svg",
            textClassName: "app-badge-danger",
            backgroundClassName: "",
          },
        ],
      },
    ],
    [],
  );

  const rowActions = useMemo<DataTableRowActionsConfig<Tienda>>(
    () => ({
      headerLabel: "Acciones",
      primaryButtonLabel: "Administrar",
      onPrimaryAction: (store) => {
        router.push(`/tiendas/${store.id}`);
      },
      dropdownOptions: [
        {
          label: "Ver catalogo",
          onClick: (store) => {
            router.push(`/${store.slug}`);
          },
        },
        {
          label: (store) => (store.estado ? "Inactivar" : "Activar"),
          onClick: handleToggleStoreStatus,
        },
      ],
    }),
    [handleToggleStoreStatus, router],
  );

  const handleCreateStore = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setCreateFormError(null);

      const phoneNumber = createForm.numeroTelefono.replace(/\s+/g, "").trim();
      const countryCode = createForm.codigoPais.trim();

      if (!phoneNumber) {
        setCreateFormError("Debes ingresar un numero telefonico.");
        return;
      }

      if (!countryCode.startsWith("+")) {
        setCreateFormError("El codigo de pais debe incluir el prefijo +.");
        return;
      }

      setIsCreating(true);

      try {
        await createTienda({
          nombre: createForm.nombre.trim(),
          telefono: `${countryCode}${phoneNumber}`,
          moneda: createForm.moneda.trim(),
          logoUrl: createForm.logoUrl.trim(),
          estado: createForm.estado,
        });

        closeCreateFormPanel(true);
        toast.success("Tienda creada correctamente.", "Tienda");
        setPage(1);
        await loadStores();
      } catch (saveError) {
        setCreateFormError(
          saveError instanceof Error
            ? saveError.message
            : "No se pudo crear la tienda.",
        );
      } finally {
        setIsCreating(false);
      }
    },
    [closeCreateFormPanel, createForm, loadStores, toast],
  );

  const toolbarActions = useMemo<DataTableToolbarAction[]>(
    () => [
      {
        label: "Nueva Tienda",
        iconPath: "/icons/plus.svg",
        onClick: () => {
          resetCreateForm();
          openCreateFormPanel();
        },
      },
    ],
    [openCreateFormPanel, resetCreateForm],
  );

  return (
    <section className="space-y-5">
      <div className="space-y-4 rounded-2xl">
          <div className="app-card rounded-2xl px-3 py-5">
          <div className="flex flex-row items-center gap-2">
            <div className="min-w-0 flex-1">
              <SearchBar
                value={searchTerm}
                onChange={(value) => {
                  setPage(1);
                  setSearchTerm(value);
                }}
                placeholder="Buscar por nombre, slug, telefono o moneda"
              />
            </div>

            <ToolbarActions actions={toolbarActions} className="shrink-0" />
          </div>
        </div>

        {error ? (
          <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
            {error}
          </p>
        ) : null}
      </div>

      {isCreateFormMounted ? (
        <StoreCreateFormPanel
          isVisible={isCreateFormVisible}
          form={createForm}
          isSaving={isCreating}
          formError={createFormError}
          onSubmit={handleCreateStore}
          onClose={() => closeCreateFormPanel(true)}
          onNombreChange={(value) =>
            setCreateForm((current) => ({ ...current, nombre: value }))
          }
          onCodigoPaisChange={(value) =>
            setCreateForm((current) => ({ ...current, codigoPais: value }))
          }
          onNumeroTelefonoChange={(value) =>
            setCreateForm((current) => ({ ...current, numeroTelefono: value }))
          }
          onMonedaChange={(value) =>
            setCreateForm((current) => ({ ...current, moneda: value }))
          }
          onLogoUrlChange={(value) =>
            setCreateForm((current) => ({ ...current, logoUrl: value }))
          }
          onEstadoChange={(value) =>
            setCreateForm((current) => ({ ...current, estado: value }))
          }
        />
      ) : null}

      <div className="app-card rounded-2xl py-5">
        <DataTableToolbar
          pageSize={pageSize}
          onPageSizeChange={(value) => {
            setPage(1);
            setPageSize(value);
          }}
        />
        <div className="app-divider mb-2 mt-1 border-b" />
        <div className="px-3">
          <DataTable
            headers={columns}
            rows={stores}
            isLoading={isLoading}
            rowKey="id"
            emptyMessage="No hay tiendas que coincidan con los filtros aplicados."
            badges={badges}
            rowActions={rowActions}
            pagination={{
              page,
              totalPages,
              totalRecords,
              onPageChange: setPage,
            }}
          />
        </div>
      </div>
    </section>
  );
}
