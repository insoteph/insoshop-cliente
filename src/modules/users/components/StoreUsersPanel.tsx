"use client";

import { useEffect, useMemo, useState } from "react";

import { DataTable } from "@/modules/core/components/DataTable";

import { fetchStoreUsers } from "@/modules/users/services/user-service";
import type { UserRecord } from "@/modules/users/types/users-types";

type StoreUsersPanelProps = {
  storeId: number;
};

export function StoreUsersPanel({ storeId }: StoreUsersPanelProps) {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "activos" | "inactivos" | "todos"
  >("todos");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUsers() {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchStoreUsers({
          storeId,
          page,
          pageSize,
          search,
          estadoFiltro: statusFilter,
        });

        setUsers(result.items);
        setTotalPages(result.totalPages);
        setTotalRecords(result.totalRecords);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudieron cargar los usuarios."
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadUsers();
  }, [page, pageSize, search, statusFilter, storeId]);

  const columns = useMemo(
    () => [
      {
        key: "username",
        header: "Usuario",
        render: (user: UserRecord) => (
          <div className="space-y-1">
            <p className="font-semibold text-[var(--foreground)]">
              {user.detalleUsuario
                ? `${user.detalleUsuario.nombres} ${user.detalleUsuario.apellidos}`
                : user.username}
            </p>
            <p className="text-xs text-[var(--muted)]">@{user.username}</p>
          </div>
        ),
      },
      {
        key: "email",
        header: "Correo",
      },
      {
        key: "telefono",
        header: "Teléfono",
        render: (user: UserRecord) => user.telefono || "-",
      },
      {
        key: "status",
        header: "Estado",
        render: (user: UserRecord) => (
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
              user.status
                ? "app-badge-success"
                : "app-badge-neutral"
            }`}
          >
            {user.status ? "Activo" : "Inactivo"}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <section className="space-y-5">
      <div className="panel-card space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-[var(--foreground)]">
            Usuarios asociados
          </h3>
          <p className="text-sm text-[var(--muted)]">
            Consulta el equipo con acceso a la tienda seleccionada.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
          <input
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            placeholder="Buscar por usuario o correo"
            className="app-input rounded-2xl px-4 py-3 text-sm"
          />
          <select
            value={statusFilter}
            onChange={(event) => {
              setPage(1);
              setStatusFilter(
                event.target.value as "activos" | "inactivos" | "todos"
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

      <DataTable
        headers={columns}
        data={users}
        isLoading={isLoading}
        rowKey="id"
        emptyMessage="No hay usuarios asociados a esta tienda."
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
