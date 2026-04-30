"use client";

type RolesManagementHeaderProps = {
  search: string;
  canCreateRole: boolean;
  onSearchChange: (value: string) => void;
  onCreateRole: () => void;
};

export function RolesManagementHeader({
  search,
  canCreateRole,
  onSearchChange,
  onCreateRole,
}: RolesManagementHeaderProps) {
  return (
    <div className="panel-card space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            Módulo administrativo
          </p>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">
            Roles
          </h1>
          <p className="max-w-3xl text-sm text-[var(--muted)]">
            Listado de roles con acciones de detalle, edición y eliminación.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 md:flex-row xl:max-w-2xl">
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar rol"
            className="app-input w-full rounded-2xl px-4 py-3 text-sm"
          />

          {canCreateRole ? (
            <button
              type="button"
              className="app-button-primary rounded-2xl px-4 py-3 text-sm font-semibold"
              onClick={onCreateRole}
            >
              Crear nuevo rol
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
