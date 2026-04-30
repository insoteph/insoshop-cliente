"use client";

import { CatalogAttributeFormPanel } from "@/modules/attribute-catalog/components/CatalogAttributeFormPanel";
import { CatalogAttributesTable } from "@/modules/attribute-catalog/components/CatalogAttributesTable";
import { CatalogAttributesToolbar } from "@/modules/attribute-catalog/components/CatalogAttributesToolbar";
import { useCatalogAttributesManagement } from "@/modules/attribute-catalog/hooks/useCatalogAttributesManagement";

export function CatalogAttributesManagementView() {
  const {
    attributes,
    page,
    totalPages,
    totalRecords,
    search,
    statusFilter,
    isLoading,
    error,
    isFormMounted,
    isFormVisible,
    editingAttributeId,
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
    onNombreChange,
    onEstadoChange,
    onValueTextChange,
    onValueColorChange,
    onValueUsesColorChange,
    onValueOrderChange,
    onAddValue,
    onRemoveValue,
  } = useCatalogAttributesManagement();

  return (
    <section className="space-y-5">
      <CatalogAttributesToolbar
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

      <CatalogAttributeFormPanel
        isMounted={isFormMounted}
        isVisible={isFormVisible}
        editingAttributeId={editingAttributeId}
        form={form}
        isSaving={isSaving}
        formError={formError}
        onClose={onCloseForm}
        onSubmit={onSubmit}
        onNombreChange={onNombreChange}
        onEstadoChange={onEstadoChange}
        onValueTextChange={onValueTextChange}
        onValueColorChange={onValueColorChange}
        onValueUsesColorChange={onValueUsesColorChange}
        onValueOrderChange={onValueOrderChange}
        onAddValue={onAddValue}
        onRemoveValue={onRemoveValue}
      />

      <CatalogAttributesTable
        rows={attributes}
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
