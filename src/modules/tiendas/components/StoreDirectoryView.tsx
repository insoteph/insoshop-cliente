"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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
import { formatDate } from "@/modules/core/lib/formatters";
import { fetchTiendas } from "@/modules/tiendas/services/tiendas-service";
import type { Tienda } from "@/modules/tiendas/types/tiendas-types";

export function StoreDirectoryView() {
  const router = useRouter();
  const [stores, setStores] = useState<Tienda[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    async function loadStores() {
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
    }

    void loadStores();
  }, [debouncedSearch, page, pageSize]);

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
          label: "Ver detalle",
          onClick: (store) => {
            window.alert(`Ver detalle de: ${store.nombre}`);
          },
        },
        {
          label: "Editar",
          onClick: (store) => {
            window.alert(`Editar tienda: ${store.nombre}`);
          },
        },
        {
          label: "Desactivar",
          onClick: (store) => {
            window.alert(`Desactivar tienda: ${store.nombre}`);
          },
        },
      ],
    }),
    [router],
  );

  const toolbarActions = useMemo<DataTableToolbarAction[]>(
    () => [
      {
        label: "Nueva Tienda",
        iconPath: "/icons/plus.svg",
        onClick: () => {
          window.alert("Nueva");
        },
      },
    ],
    [],
  );

  return (
    <section className="space-y-5">
      <div className="space-y-4 rounded-2xl">
        <div className="app-card rounded-2xl px-3 py-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="w-full">
              <SearchBar
                value={searchTerm}
                onChange={(value) => {
                  setPage(1);
                  setSearchTerm(value);
                }}
                placeholder="Buscar por nombre, slug, telefono o moneda"
              />
            </div>

            <ToolbarActions actions={toolbarActions} className="md:shrink-0" />
          </div>
        </div>

        {error ? (
          <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
            {error}
          </p>
        ) : null}
      </div>

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
