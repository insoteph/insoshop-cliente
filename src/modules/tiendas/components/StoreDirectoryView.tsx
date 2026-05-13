"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  DataTable,
  type DataTableBadgeConfig,
  type DataTableColumn,
  type DataTableRowActionsConfig,
} from "@/modules/core/components/DataTable";
import { useConfirmationDialog } from "@/modules/core/providers/ConfirmationDialogProvider";
import { useToast } from "@/modules/core/providers/ToastProvider";
import {
  fetchTiendas,
  createTienda,
  fetchPaises,
  toggleTiendaStatus,
} from "@/modules/tiendas/services/tiendas-service";
import {
  StoreCreateFormPanel,
  type StoreCreateFormState,
} from "@/modules/tiendas/components/StoreCreateFormPanel";
import { StoreDirectoryHeader } from "@/modules/tiendas/components/StoreDirectoryHeader";
import { buildStoreAdminUrl } from "@/modules/tiendas/lib/store-routing";
import type {
  PaisTelefono,
  Tienda,
} from "@/modules/tiendas/types/tiendas-types";

const INITIAL_CREATE_FORM: StoreCreateFormState = {
  nombre: "",
  subdominio: "",
  codigoPais: "",
  numeroTelefono: "",
  estado: true,
};
const FORM_ANIMATION_MS = 500;

export function StoreDirectoryView() {
  const router = useRouter();
  const { confirm } = useConfirmationDialog();
  const toast = useToast();
  const [stores, setStores] = useState<Tienda[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;
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
  const [availablePaises, setAvailablePaises] = useState<PaisTelefono[]>([]);
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

  const resolveDefaultCreateForm = useCallback(() => {
    const defaultCountry =
      availablePaises.find((country) => country.estado) ??
      availablePaises[0];

    if (!defaultCountry) {
      return INITIAL_CREATE_FORM;
    }

    return {
      ...INITIAL_CREATE_FORM,
      codigoPais: defaultCountry.codigoPais,
    };
  }, [availablePaises]);

  useEffect(() => {
    async function loadPaises() {
      try {
        const result = await fetchPaises();
        setAvailablePaises(result);
        setCreateForm((current) => {
          if (current.codigoPais || result.length === 0) {
            return current;
          }

          const defaultCountry =
            result.find((country) => country.estado) ?? result[0];

          if (!defaultCountry) {
            return current;
          }

          return {
            ...current,
            codigoPais: defaultCountry.codigoPais,
          };
        });
      } catch {
        setAvailablePaises([]);
      }
    }

    void loadPaises();
  }, []);

  const resetCreateForm = useCallback(() => {
    setCreateForm(resolveDefaultCreateForm());
    setCreateFormError(null);
  }, [resolveDefaultCreateForm]);

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
          codigoPais: store.codigoPais,
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
        desktopImageConfig: {
          alt: (store) => `Logo de ${store.nombre}`,
          width: 72,
          height: 72,
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
        headerIconPath: "/icons/link.svg",
        textFormatter: (value) => `/${String(value ?? "")}`,
      },
      {
        key: "telefono",
        header: "Telefono",
        headerIconPath: "/icons/whatsapp.svg",
        textFormatter: (_, row) =>
          `${row.telefonoCodigoPais} ${row.telefono}`.trim(),
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
      primaryButtonIconPath: "/icons/redirect.svg",
      onPrimaryAction: (store) => {
        window.location.assign(buildStoreAdminUrl(store.subdominio));
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

      if (!phoneNumber) {
        setCreateFormError("Debes ingresar un numero telefonico.");
        return;
      }

      if (!createForm.codigoPais.trim()) {
        setCreateFormError("Debes seleccionar un pais.");
        return;
      }

      setIsCreating(true);

      try {
        await createTienda({
          nombre: createForm.nombre.trim(),
          subdominio: createForm.subdominio.trim(),
          telefono: phoneNumber,
          codigoPais: createForm.codigoPais.trim(),
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

  return (
    <section className="space-y-5">
      <div className="app-card overflow-hidden rounded-2xl shadow-[0_12px_30px_rgba(15,23,42,0.07)]">
        <div className="space-y-4 px-4 py-4 md:px-5 md:py-5">
          <StoreDirectoryHeader
            onNewStore={() => {
              resetCreateForm();
              openCreateFormPanel();
            }}
            searchTerm={searchTerm}
            onSearchTermChange={(value) => {
              setPage(1);
              setSearchTerm(value);
            }}
          />

          {error ? (
            <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
              {error}
            </p>
          ) : null}
        </div>

        <div className="border-t border-[var(--line)]" />

        <div className="px-0 pb-0">
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
          onSubdominioChange={(value) =>
            setCreateForm((current) => ({ ...current, subdominio: value }))
          }
          onCodigoPaisChange={(value) =>
            setCreateForm((current) => ({ ...current, codigoPais: value }))
          }
          onNumeroTelefonoChange={(value) =>
            setCreateForm((current) => ({ ...current, numeroTelefono: value }))
          }
          onEstadoChange={(value) =>
            setCreateForm((current) => ({ ...current, estado: value }))
          }
          availablePaises={availablePaises}
        />
      ) : null}
    </section>
  );
}
