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
import { useToast } from "@/modules/core/providers/ToastProvider";
import {
  createPaymentMethod,
  fetchPaymentMethods,
  togglePaymentMethodStatus,
  type PaymentMethod,
  updatePaymentMethod,
} from "@/modules/settings/services/payment-methods-service";

type PaymentMethodsSettingsPanelProps = {
  storeId: number;
  hasGlobalAccess: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canToggle: boolean;
};

type PaymentMethodFormState = {
  nombre: string;
};

const INITIAL_FORM_STATE: PaymentMethodFormState = {
  nombre: "",
};

export function PaymentMethodsSettingsPanel({
  storeId,
  hasGlobalAccess,
  canCreate,
  canEdit,
  canToggle,
}: PaymentMethodsSettingsPanelProps) {
  const { confirm } = useConfirmationDialog();
  const toast = useToast();
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
  const [message, setMessage] = useState<string | null>(null);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<PaymentMethodFormState>(INITIAL_FORM_STATE);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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

  useEffect(() => {
    if (!isFormOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isFormOpen]);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingMethod(null);
    setForm(INITIAL_FORM_STATE);
    setFormError(null);
  }, []);

  const openCreateForm = useCallback(() => {
    setMessage(null);
    setFormError(null);
    setEditingMethod(null);
    setForm(INITIAL_FORM_STATE);
    setIsFormOpen(true);
  }, []);

  const openEditForm = useCallback((method: PaymentMethod) => {
    setMessage(null);
    setFormError(null);
    setEditingMethod(method);
    setForm({
      nombre: method.nombre,
    });
    setIsFormOpen(true);
  }, []);

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

      setMessage(null);

      try {
        await togglePaymentMethodStatus(method.id, storeId);
        setMessage(
          method.estado
            ? "Metodo de pago inactivado correctamente."
            : "Metodo de pago activado correctamente.",
        );
        toast.success(
          method.estado
            ? "Metodo de pago inactivado correctamente."
            : "Metodo de pago activado correctamente.",
          "Metodo de pago",
        );
        await loadMethods();
      } catch (toggleError) {
        setError(
          toggleError instanceof Error
            ? toggleError.message
            : "No se pudo actualizar el estado del metodo de pago.",
        );
      }
    },
    [confirm, loadMethods, storeId, toast],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setMessage(null);

    if (!form.nombre.trim()) {
      setFormError("El nombre del metodo de pago es obligatorio.");
      return;
    }

    setIsSaving(true);

    try {
      if (editingMethod) {
        await updatePaymentMethod(editingMethod.id, {
          nombre: form.nombre.trim(),
          storeId,
          hasGlobalAccess,
        });
        setMessage("Metodo de pago actualizado correctamente.");
        toast.success("Metodo de pago editado correctamente.", "Metodo de pago");
      } else {
        await createPaymentMethod({
          nombre: form.nombre.trim(),
          storeId,
          hasGlobalAccess,
        });
        setMessage("Metodo de pago creado correctamente.");
        toast.success("Metodo de pago creado correctamente.", "Metodo de pago");
      }

      closeForm();
      await loadMethods();
    } catch (saveError) {
      setFormError(
        saveError instanceof Error
          ? saveError.message
          : editingMethod
            ? "No se pudo actualizar el metodo de pago."
            : "No se pudo crear el metodo de pago.",
      );
    } finally {
      setIsSaving(false);
    }
  }

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

  const rowActions = canEdit || canToggle
    ? {
        primaryButtonLabel: canEdit ? "Editar" : "Cambiar estado",
        onPrimaryAction: canEdit ? openEditForm : handleToggleStatus,
        dropdownOptions: [
          ...(canEdit
            ? [
                {
                  label: "Editar",
                  onClick: openEditForm,
                },
              ]
            : []),
          ...(canToggle
            ? [
                {
                  label: (method: PaymentMethod) =>
                    method.estado ? "Inactivar" : "Activar",
                  onClick: handleToggleStatus,
                },
              ]
            : []),
        ],
      }
    : undefined;

  return (
    <section className="space-y-5">
      <div className="space-y-4 rounded-md border border-[var(--line)] bg-[var(--panel)] p-5 shadow-md">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[var(--foreground)]">
              Metodos de pago
            </h3>
            <p className="text-sm text-[var(--muted)]">
              Gestiona disponibilidad y nombres de metodos segun el alcance de tu usuario.
            </p>
          </div>

          {canCreate ? (
            <button
              type="button"
              className="app-button-primary rounded-2xl px-4 py-3 text-sm font-semibold"
              onClick={openCreateForm}
            >
              Crear metodo de pago
            </button>
          ) : null}
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

        {message ? (
          <p className="app-alert-success rounded-2xl px-4 py-3 text-sm">
            {message}
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

      {isFormOpen ? (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="payment-method-modal-title"
          onClick={() => {
            if (!isSaving) {
              closeForm();
            }
          }}
        >
          <form
            className="w-full max-w-xl space-y-5 rounded-[28px] border border-[var(--line)] bg-[var(--panel-strong)] p-6 shadow-[var(--shadow)]"
            onSubmit={handleSubmit}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                  Configuración
                </p>
                <h4
                  id="payment-method-modal-title"
                  className="text-xl font-semibold text-[var(--foreground)]"
                >
                  {editingMethod ? "Editar metodo de pago" : "Crear metodo de pago"}
                </h4>
                <p className="text-sm text-[var(--muted)]">
                  {editingMethod
                    ? "Actualiza el nombre del metodo de pago seleccionado."
                    : "Registra un nuevo metodo de pago para esta tienda."}
                </p>
              </div>

              <button
                type="button"
                className="app-button-secondary rounded-2xl px-3 py-2 text-sm font-semibold"
                onClick={closeForm}
                disabled={isSaving}
              >
                Cerrar
              </button>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="payment-method-name"
                className="text-sm font-medium text-[var(--foreground)]"
              >
                Nombre
              </label>
              <input
                id="payment-method-name"
                required
                autoFocus
                value={form.nombre}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    nombre: event.target.value,
                  }))
                }
                placeholder="Nombre del metodo de pago"
                className="app-input w-full rounded-2xl px-4 py-3 text-sm"
              />
            </div>

            {formError ? (
              <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
                {formError}
              </p>
            ) : null}

            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="app-button-secondary rounded-2xl px-4 py-3 text-sm font-semibold"
                onClick={closeForm}
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="app-button-primary rounded-2xl px-4 py-3 text-sm font-semibold disabled:opacity-60"
                disabled={isSaving}
              >
                {isSaving ? "Guardando..." : editingMethod ? "Guardar cambios" : "Crear"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}
