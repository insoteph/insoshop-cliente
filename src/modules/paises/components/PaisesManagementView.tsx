"use client";

import { PaisFormPanel } from "@/modules/paises/components/PaisFormPanel";
import { PaisesTable } from "@/modules/paises/components/PaisesTable";
import { PaisesToolbar } from "@/modules/paises/components/PaisesToolbar";
import { usePaisesManagement } from "@/modules/paises/hooks/usePaisesManagement";

export function PaisesManagementView() {
  const {
    paises,
    page,
    totalPages,
    totalRecords,
    search,
    statusFilter,
    isLoading,
    error,
    isFormMounted,
    isFormVisible,
    editingPaisId,
    form,
    formError,
    isSaving,
    onPageChange,
    onSearchChange,
    onStatusFilterChange,
    onCreateClick,
    onEditClick,
    onToggleStatus,
    onCloseForm,
    onSubmit,
    onNombrePaisChange,
    onCodigoPaisChange,
    onCodigoTelefonoChange,
    onMascaraTelefonoChange,
    onMonedaNombreChange,
    onSimboloMonedaChange,
    onMonedaCodigoChange,
    onEstadoChange,
  } = usePaisesManagement();

  return (
    <section className="space-y-5">
      <PaisesToolbar
        search={search}
        statusFilter={statusFilter}
        onSearchChange={onSearchChange}
        onStatusFilterChange={onStatusFilterChange}
        onCreateClick={onCreateClick}
      />

      {error ? (
        <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
          {error}
        </p>
      ) : null}

      <PaisFormPanel
        isMounted={isFormMounted}
        isVisible={isFormVisible}
        editingPaisId={editingPaisId}
        form={form}
        isSaving={isSaving}
        formError={formError}
        onClose={onCloseForm}
        onSubmit={onSubmit}
        onNombrePaisChange={onNombrePaisChange}
        onCodigoPaisChange={onCodigoPaisChange}
        onCodigoTelefonoChange={onCodigoTelefonoChange}
        onMascaraTelefonoChange={onMascaraTelefonoChange}
        onMonedaNombreChange={onMonedaNombreChange}
        onSimboloMonedaChange={onSimboloMonedaChange}
        onMonedaCodigoChange={onMonedaCodigoChange}
        onEstadoChange={onEstadoChange}
      />

      <PaisesTable
        rows={paises}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        totalRecords={totalRecords}
        onPageChange={onPageChange}
        onEdit={onEditClick}
        onToggleStatus={onToggleStatus}
      />
    </section>
  );
}
