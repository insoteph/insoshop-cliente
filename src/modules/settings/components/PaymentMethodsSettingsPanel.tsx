"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  DataTable,
  type DataTableBadgeConfig,
  type DataTableColumn,
} from "@/modules/core/components/DataTable";
import { DataTableToolbar } from "@/modules/core/components/DataTableToolbar";
import { SearchBar } from "@/modules/core/components/SearchBar";
import { useConfirmationDialog } from "@/modules/core/providers/ConfirmationDialogProvider";
import {
  fetchPaymentMethods,
  togglePaymentMethodStatus,
  type PaymentMethod,
} from "@/modules/settings/services/payment-methods-service";

type PaymentMethodsSettingsPanelProps = {
  storeId: number;
  hasGlobalAccess: boolean;
  canToggle: boolean;
};

export function PaymentMethodsSettingsPanel({
  storeId,
  hasGlobalAccess,
  canToggle,
}: PaymentMethodsSettingsPanelProps) {
  const { confirm } = useConfirmationDialog();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "activos" | "inactivos" | "todos"
  >("todos");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMethods = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchPaymentMethods({
        storeId,
        hasGlobalAccess,
        page,
        pageSize,
        search,
        estadoFiltro: statusFilter,
      });

      setMethods(result.items);
      setTotalPages(result.totalPages);
      setTotalRecords(result.totalRecords);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudieron cargar los metodos de pago.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [hasGlobalAccess, page, pageSize, search, statusFilter, storeId]);

  useEffect(() => {
    void loadMethods();
  }, [loadMethods]);

  const handleToggleStatus = useCallback(
    async (method: PaymentMethod) => {
      const nextAction = method.estado ? "inactivar" : "activar";
      const shouldContinue = await confirm({
        title: "Confirmar accion",
        description: `Deseas ${nextAction} este metodo de pago?`,
        confirmLabel: method.estado ? "Inactivar" : "Activar",
        variant: method.estado ? "danger" : "primary",
      });

      if (!shouldContinue) {
        return;
      }

      try {
        await togglePaymentMethodStatus(method.id, storeId);
        await loadMethods();
      } catch (toggleError) {
        setError(
          toggleError instanceof Error
            ? toggleError.message
            : "No se pudo actualizar el estado del metodo de pago.",
        );
      }
    },
    [confirm, loadMethods, storeId],
  );

  const columns = useMemo<DataTableColumn<PaymentMethod>[]>(() => {
    const baseColumns: DataTableColumn<PaymentMethod>[] = [
      {
        key: "nombre",
        header: "Metodo de pago",
        className: "font-semibold",
      },
      {
        key: "estado",
        header: "Estado",
      },
    ];

    if (hasGlobalAccess) {
      baseColumns.splice(1, 0, {
        key: "tiendaNombre",
        header: "Tienda",
      });
    }

    return baseColumns;
  }, [hasGlobalAccess]);

  const stateBadges = useMemo<Array<DataTableBadgeConfig<PaymentMethod>>>(
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
            textClassName: "app-badge-neutral",
            backgroundClassName: "",
          },
        ],
      },
    ],
    [],
  );

  const rowActions = canToggle
    ? {
        primaryButtonLabel: "Cambiar estado",
        onPrimaryAction: handleToggleStatus,
        dropdownOptions: [
          {
            label: (method: PaymentMethod) =>
              method.estado ? "Inactivar" : "Activar",
            onClick: handleToggleStatus,
          },
        ],
      }
    : undefined;

  return (
    <section className="space-y-5">
      <div className="space-y-4 rounded-md border border-[var(--line)] bg-[var(--panel)] p-5 shadow-md">
        <div>
          <h3 className="text-lg font-semibold text-[var(--foreground)]">
            Metodos de pago
          </h3>
          <p className="text-sm text-[var(--muted)]">
            Gestiona disponibilidad de metodos segun el alcance de tu usuario.
          </p>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_240px]">
          <SearchBar
            value={search}
            onChange={(value) => {
              setPage(1);
              setSearch(value);
            }}
            placeholder="Buscar metodo de pago"
            ariaLabel="Buscar metodos de pago"
          />

          <select
            value={statusFilter}
            onChange={(event) => {
              setPage(1);
              setStatusFilter(
                event.target.value as "activos" | "inactivos" | "todos",
              );
            }}
            className="app-input rounded-2xl px-4 py-3 text-sm"
          >
            <option value="todos">Todos los estados</option>
            <option value="activos">Solo activos</option>
            <option value="inactivos">Solo inactivos</option>
          </select>
        </div>

        {error ? (
          <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
            {error}
          </p>
        ) : null}
      </div>

      <div className="app-card rounded-2xl py-2">
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
            data={methods}
            isLoading={isLoading}
            rowKey="id"
            emptyMessage="No hay metodos de pago disponibles."
            badges={stateBadges}
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
