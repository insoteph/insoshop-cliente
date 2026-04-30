"use client";

import { DataTable } from "@/modules/core/components/DataTable";
import type { DataTableRowActionsConfig } from "@/modules/core/components/DataTable";
import type { RoleListItem } from "@/modules/roles/types/roles-types";

type RolesTableProps = {
  roles: RoleListItem[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  totalRecords: number;
  rowActions: DataTableRowActionsConfig<RoleListItem>;
  onPageChange: (page: number) => void;
};

export function RolesTable({
  roles,
  isLoading,
  page,
  totalPages,
  totalRecords,
  rowActions,
  onPageChange,
}: RolesTableProps) {
  return (
    <DataTable
      headers={[
        {
          key: "name",
          header: "Rol",
          render: (role: RoleListItem) => (
            <div className="space-y-1">
              <p className="font-semibold text-[var(--foreground)]">
                {role.name}
              </p>
              <p className="text-xs text-[var(--muted)]">ID: {role.id}</p>
            </div>
          ),
        },
      ]}
      data={roles}
      isLoading={isLoading}
      rowKey="id"
      emptyMessage="No hay roles registrados."
      pagination={{
        page,
        totalPages,
        totalRecords,
        onPageChange,
      }}
      rowActions={rowActions}
    />
  );
}
