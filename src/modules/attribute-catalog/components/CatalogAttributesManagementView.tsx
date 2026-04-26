"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  createCatalogAttribute,
  fetchCatalogAttributeById,
  fetchCatalogAttributes,
  toggleCatalogAttributeStatus,
  updateCatalogAttribute,
  type CatalogAttribute,
  type CatalogAttributeDetail,
} from "@/modules/attribute-catalog/services/attribute-catalog-service";
import {
  DataTable,
  type DataTableBadgeConfig,
  type DataTableColumn,
} from "@/modules/core/components/DataTable";
import { SearchBar } from "@/modules/core/components/SearchBar";
import {
  ToolbarActions,
  type DataTableToolbarAction,
} from "@/modules/core/components/DataTableToolbar";
import { MaterialInput } from "@/modules/core/components/MaterialInput";
import { useConfirmationDialog } from "@/modules/core/providers/ConfirmationDialogProvider";
import { useToast } from "@/modules/core/providers/ToastProvider";

type CatalogAttributeFormValue = {
  id: string;
  valor: string;
  colorHexadecimal: string;
  usaColor: boolean;
  orden: string;
};

type CatalogAttributeFormState = {
  nombre: string;
  estado: boolean;
  valores: CatalogAttributeFormValue[];
};

const INITIAL_FORM: CatalogAttributeFormState = {
  nombre: "",
  estado: true,
  valores: [
    {
      id: "initial-value",
      valor: "",
      colorHexadecimal: "#000000",
      usaColor: false,
      orden: "1",
    },
  ],
};

const FORM_ANIMATION_MS = 400;

function buildFormValues(detail: CatalogAttributeDetail): CatalogAttributeFormValue[] {
  return detail.valores.length > 0
    ? detail.valores.map((value) => ({
        id: `value-${value.id}`,
        valor: value.valor,
        colorHexadecimal: value.colorHexadecimal ?? "#000000",
        usaColor: Boolean(value.colorHexadecimal),
        orden: String(value.orden),
      }))
    : [
        {
          id: "initial-value",
          valor: "",
          colorHexadecimal: "#000000",
          usaColor: false,
          orden: "1",
        },
      ];
}

export function CatalogAttributesManagementView() {
  const { confirm } = useConfirmationDialog();
  const toast = useToast();
  const [attributes, setAttributes] = useState<CatalogAttribute[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "activos" | "inactivos" | "todos"
  >("todos");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isFormMounted, setIsFormMounted] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingAttributeId, setEditingAttributeId] = useState<number | null>(
    null,
  );
  const [form, setForm] = useState<CatalogAttributeFormState>(INITIAL_FORM);
  const closeFormTimeoutRef = useRef<number | null>(null);

  const loadAttributes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchCatalogAttributes({
        page,
        pageSize,
        search,
        estadoFiltro: statusFilter,
      });

      setAttributes(result.items);
      setTotalPages(result.totalPages);
      setTotalRecords(result.totalRecords);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudieron cargar los atributos de catálogo.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search, statusFilter]);

  useEffect(() => {
    void loadAttributes();
  }, [loadAttributes]);

  const resetForm = useCallback(() => {
    setEditingAttributeId(null);
    setForm(INITIAL_FORM);
    setFormError(null);
  }, []);

  const clearCloseFormTimeout = useCallback(() => {
    if (closeFormTimeoutRef.current) {
      window.clearTimeout(closeFormTimeoutRef.current);
      closeFormTimeoutRef.current = null;
    }
  }, []);

  const openFormPanel = useCallback(() => {
    clearCloseFormTimeout();
    setIsFormMounted(true);
    window.requestAnimationFrame(() => {
      setIsFormVisible(true);
    });
  }, [clearCloseFormTimeout]);

  const closeFormPanel = useCallback(
    (shouldReset = true) => {
      setIsFormVisible(false);
      clearCloseFormTimeout();
      closeFormTimeoutRef.current = window.setTimeout(() => {
        setIsFormMounted(false);
        if (shouldReset) {
          resetForm();
        }
      }, FORM_ANIMATION_MS);
    },
    [clearCloseFormTimeout, resetForm],
  );

  useEffect(() => {
    return () => {
      clearCloseFormTimeout();
    };
  }, [clearCloseFormTimeout]);

  const handleCreateClick = useCallback(() => {
    resetForm();
    openFormPanel();
  }, [openFormPanel, resetForm]);

  const handleEditClick = useCallback(
    async (attribute: CatalogAttribute) => {
      try {
        const detail = await fetchCatalogAttributeById(attribute.id);
        setEditingAttributeId(detail.id);
        setForm({
          nombre: detail.nombre,
          estado: detail.estado,
          valores: buildFormValues(detail),
        });
        setFormError(null);
        openFormPanel();
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudo cargar el detalle del atributo.",
        );
      }
    },
    [openFormPanel],
  );

  const handleToggleStatus = useCallback(
    async (attribute: CatalogAttribute) => {
      const shouldContinue = await confirm({
        title: "Cambiar estado del atributo",
        description: `El atributo "${attribute.nombre}" pasará a estado ${attribute.estado ? "inactivo" : "activo"}.`,
        confirmLabel: attribute.estado ? "Inactivar" : "Activar",
        variant: attribute.estado ? "danger" : "primary",
      });

      if (!shouldContinue) {
        return;
      }

      try {
        await toggleCatalogAttributeStatus(attribute.id);
        await loadAttributes();
        toast.success(
          attribute.estado
            ? "Atributo inactivado correctamente."
            : "Atributo activado correctamente.",
          "Atributo",
        );
      } catch (toggleError) {
        setError(
          toggleError instanceof Error
            ? toggleError.message
            : "No se pudo cambiar el estado del atributo.",
        );
      }
    },
    [confirm, loadAttributes, toast],
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setFormError(null);

      const valores = form.valores
        .map((value) => ({
          valor: value.valor.trim(),
          colorHexadecimal: value.usaColor
            ? value.colorHexadecimal.trim().toUpperCase()
            : null,
          orden: Number(value.orden),
        }))
        .filter((value) => value.valor.length > 0);

      if (!form.nombre.trim()) {
        setFormError("El nombre del atributo es obligatorio.");
        return;
      }

      if (valores.length === 0) {
        setFormError("Debes agregar al menos un valor para el atributo.");
        return;
      }

      setIsSaving(true);

      try {
        const payload = {
          nombre: form.nombre.trim(),
          estado: form.estado,
          valores,
        };

        if (editingAttributeId) {
          await updateCatalogAttribute(editingAttributeId, payload);
          toast.success("Atributo editado correctamente.", "Atributo");
        } else {
          await createCatalogAttribute(payload);
          toast.success("Atributo creado correctamente.", "Atributo");
        }

        closeFormPanel(true);
        await loadAttributes();
      } catch (saveError) {
        setFormError(
          saveError instanceof Error
            ? saveError.message
            : "No se pudo guardar el atributo de catálogo.",
        );
      } finally {
        setIsSaving(false);
      }
    },
    [closeFormPanel, editingAttributeId, form, loadAttributes, toast],
  );

  const columns = useMemo<DataTableColumn<CatalogAttribute>[]>(
    () => [
      {
        key: "nombre",
        header: "Atributo",
        className: "font-semibold",
      },
      {
        key: "cantidadValores",
        header: "Valores",
      },
      {
        key: "estado",
        header: "Estado",
      },
    ],
    [],
  );

  const stateBadges = useMemo<Array<DataTableBadgeConfig<CatalogAttribute>>>(
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

  const rowActions = {
    primaryButtonLabel: "Editar",
    onPrimaryAction: handleEditClick,
    dropdownOptions: [
      {
        label: (attribute: CatalogAttribute) =>
          attribute.estado ? "Inactivar" : "Activar",
        onClick: handleToggleStatus,
      },
    ],
  };

  const toolbarActions = useMemo<DataTableToolbarAction[]>(
    () => [
      {
        label: "Nuevo atributo",
        iconPath: "/icons/plus.svg",
        onClick: handleCreateClick,
      },
    ],
    [handleCreateClick],
  );

  return (
    <section className="space-y-5">
      <div className="space-y-4 rounded-md border border-[var(--line)] bg-[var(--panel)] p-5 shadow-md">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="w-full">
            <SearchBar
              value={search}
              onChange={(value) => {
                setPage(1);
                setSearch(value);
              }}
              placeholder="Buscar atributo de catálogo"
              ariaLabel="Buscar atributos de catálogo"
            />
          </div>
          <ToolbarActions actions={toolbarActions} className="xl:shrink-0" />
        </div>

        <div className="grid gap-3 md:grid-cols-[220px] md:justify-end">
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

      {isFormMounted ? (
        <div
          className={`origin-top overflow-hidden transition-all duration-500 ease-in-out ${
            isFormVisible
              ? "max-h-[1800px] translate-y-0 opacity-100"
              : "pointer-events-none max-h-0 -translate-y-2 opacity-0"
          }`}
        >
          <form
            className="space-y-4 rounded-md border border-[var(--line)] bg-[var(--panel)] p-5 shadow-md"
            onSubmit={handleSubmit}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-lg font-semibold text-[var(--foreground-strong)]">
                  {editingAttributeId ? "Editar atributo" : "Crear atributo"}
                </h4>
                <p className="text-sm text-[var(--muted)]">
                  Mantén nombres y valores consistentes para reutilizarlos en
                  todos los productos.
                </p>
              </div>
              <button
                type="button"
                className="app-button-secondary rounded-xl px-3 py-2 text-sm"
                onClick={() => closeFormPanel(true)}
              >
                Cerrar
              </button>
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px]">
              <MaterialInput
                id="catalog-attribute-name"
                label="Nombre del atributo"
                value={form.nombre}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    nombre: event.target.value,
                  }))
                }
                required
              />

              <label className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3 text-sm text-[var(--foreground)]">
                <input
                  type="checkbox"
                  checked={form.estado}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      estado: event.target.checked,
                    }))
                  }
                />
                Atributo activo
              </label>
            </div>

            <div className="space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--panel-strong)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h5 className="text-sm font-semibold text-[var(--foreground-strong)]">
                    Valores del atributo
                  </h5>
                  <p className="text-sm text-[var(--muted)]">
                    Define el nombre y orden de cada opción visible para los
                    productos.
                  </p>
                </div>
                <button
                  type="button"
                  className="app-button-secondary rounded-xl px-3 py-2 text-sm font-semibold"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      valores: [
                        ...current.valores,
                        {
                          id: `new-${Date.now()}-${current.valores.length}`,
                          valor: "",
                          colorHexadecimal: "#000000",
                          usaColor: false,
                          orden: String(current.valores.length + 1),
                        },
                      ],
                    }))
                  }
                >
                  Agregar valor
                </button>
              </div>

              <div className="space-y-3">
                {form.valores.map((value, index) => (
                  <div
                    key={value.id}
                    className="grid gap-3 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-3 xl:grid-cols-[minmax(0,1fr)_190px_120px_auto]"
                  >
                    <MaterialInput
                      id={`catalog-value-${value.id}`}
                      label={`Valor ${index + 1}`}
                      value={value.valor}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          valores: current.valores.map((currentValue) =>
                            currentValue.id === value.id
                              ? {
                                  ...currentValue,
                                  valor: event.target.value,
                                }
                              : currentValue,
                          ),
                        }))
                      }
                    />
                    <div className="flex min-h-[58px] items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--panel-muted)] px-3 py-2">
                      <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                        <input
                          type="checkbox"
                          checked={value.usaColor}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              valores: current.valores.map((currentValue) =>
                                currentValue.id === value.id
                                  ? {
                                      ...currentValue,
                                      usaColor: event.target.checked,
                                    }
                                  : currentValue,
                              ),
                            }))
                          }
                          className="h-4 w-4 accent-[var(--primary)]"
                        />
                        Es color
                      </label>

                      {value.usaColor ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={value.colorHexadecimal}
                            onChange={(event) =>
                              setForm((current) => ({
                                ...current,
                                valores: current.valores.map((currentValue) =>
                                  currentValue.id === value.id
                                    ? {
                                        ...currentValue,
                                        colorHexadecimal: event.target.value.toUpperCase(),
                                      }
                                    : currentValue,
                                ),
                              }))
                            }
                            className="h-9 w-11 cursor-pointer rounded-lg border border-[var(--line)] bg-transparent p-1"
                            aria-label={`Color para ${value.valor || `valor ${index + 1}`}`}
                          />
                          <span className="hidden text-[11px] font-semibold uppercase text-[var(--muted)] sm:inline">
                            {value.colorHexadecimal}
                          </span>
                        </div>
                      ) : null}
                    </div>
                    <MaterialInput
                      id={`catalog-order-${value.id}`}
                      label="Orden"
                      type="number"
                      min="0"
                      value={value.orden}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          valores: current.valores.map((currentValue) =>
                            currentValue.id === value.id
                              ? {
                                  ...currentValue,
                                  orden: event.target.value,
                                }
                              : currentValue,
                          ),
                        }))
                      }
                    />
                    <button
                      type="button"
                      className="app-button-danger rounded-xl px-3 py-2 text-sm font-semibold"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          valores:
                            current.valores.length > 1
                              ? current.valores.filter(
                                  (currentValue) => currentValue.id !== value.id,
                                )
                              : current.valores,
                        }))
                      }
                      disabled={form.valores.length <= 1}
                    >
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {formError ? (
              <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
                {formError}
              </p>
            ) : null}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="app-button-primary rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-60"
              >
                {isSaving ? "Guardando..." : "Guardar atributo"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <DataTable
        headers={columns}
        rows={attributes}
        rowKey="id"
        isLoading={isLoading}
        emptyMessage="Todavía no hay atributos de catálogo registrados."
        badges={stateBadges}
        rowActions={rowActions}
        pagination={{
          page,
          totalPages,
          totalRecords,
          onPageChange: setPage,
        }}
      />
    </section>
  );
}
