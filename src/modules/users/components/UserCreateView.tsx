"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { permissions } from "@/modules/auth/lib/permissions";
import { useAdminSession } from "@/modules/auth/providers/AdminSessionProvider";
import { fetchRoles } from "@/modules/roles/services/roles-service";
import type { RoleListItem } from "@/modules/roles/types/roles-types";
import { createUser, syncUserRoles } from "@/modules/users/services/user-service";
import type { CreateUserPayload } from "@/modules/users/types/users-types";

const INITIAL_USER_FORM: CreateUserPayload = {
  email: "",
  username: "",
  password: "",
  codigoPais: "+504",
  numeroTelefono: "",
  detalleUsuario: {
    nombres: "",
    apellidos: "",
    dni: "",
    fechaNac: "",
  },
};

export function UserCreateView() {
  const router = useRouter();
  const { hasPermission } = useAdminSession();
  const canCreateUser = hasPermission(permissions.usuarios.crear);
  const canSeeRoles = hasPermission(permissions.roles.ver);
  const canManageUserRoles =
    canSeeRoles && hasPermission(permissions.roles.gestionarUsuarios);

  const [availableRoles, setAvailableRoles] = useState<RoleListItem[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [form, setForm] = useState<CreateUserPayload>(INITIAL_USER_FORM);
  const [rolesCatalogError, setRolesCatalogError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!canManageUserRoles) {
      return;
    }

    async function loadRoles() {
      setRolesCatalogError(null);

      try {
        const result = await fetchRoles({
          page: 1,
          pageSize: 200,
        });
        setAvailableRoles(result.items);
      } catch (loadError) {
        setRolesCatalogError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudo cargar el catálogo de roles."
        );
      }
    }

    void loadRoles();
  }, [canManageUserRoles]);

  function toggleRole(roleName: string) {
    setSelectedRoles((currentRoles) =>
      currentRoles.includes(roleName)
        ? currentRoles.filter((currentRole) => currentRole !== roleName)
        : [...currentRoles, roleName]
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canCreateUser) {
      return;
    }

    setFormError(null);
    setIsSaving(true);

    try {
      const createdUser = await createUser(form);

      if (canManageUserRoles && selectedRoles.length > 0) {
        await syncUserRoles({
          userId: createdUser.id,
          currentRoles: [],
          nextRoles: selectedRoles,
        });
      }

      router.push("/usuarios");
    } catch (saveError) {
      setFormError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo crear el usuario."
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (!canCreateUser) {
    return (
      <section className="panel-card">
        <p className="text-sm text-[var(--muted)]">
          No tienes permisos para crear usuarios.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="panel-card space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              Módulo administrativo
            </p>
            <h1 className="text-2xl font-semibold text-[var(--foreground)]">
              Crear usuario
            </h1>
            <p className="max-w-3xl text-sm text-[var(--muted)]">
              Vista dedicada para la creación de un nuevo usuario.
            </p>
          </div>

          <Link
            href="/usuarios"
            className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-[var(--foreground)]"
          >
            Volver al listado
          </Link>
        </div>
      </div>

      <form className="panel-card space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-3 md:grid-cols-2">
          <input
            required
            value={form.email}
            onChange={(event) =>
              setForm((currentForm) => ({
                ...currentForm,
                email: event.target.value,
              }))
            }
            placeholder="Correo electrónico"
            className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3 text-sm text-[var(--foreground)] outline-none"
          />
          <input
            required
            value={form.username}
            onChange={(event) =>
              setForm((currentForm) => ({
                ...currentForm,
                username: event.target.value,
              }))
            }
            placeholder="Nombre de usuario"
            className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3 text-sm text-[var(--foreground)] outline-none"
          />
          <input
            required
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm((currentForm) => ({
                ...currentForm,
                password: event.target.value,
              }))
            }
            placeholder="Contraseña"
            className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3 text-sm text-[var(--foreground)] outline-none"
          />
          <div className="grid gap-3 sm:grid-cols-[140px_minmax(0,1fr)]">
            <input
              required
              value={form.codigoPais}
              onChange={(event) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  codigoPais: event.target.value,
                }))
              }
              placeholder="+504"
              className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3 text-sm text-[var(--foreground)] outline-none"
            />
            <input
              required
              value={form.numeroTelefono}
              onChange={(event) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  numeroTelefono: event.target.value,
                }))
              }
              placeholder="Número telefónico"
              className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3 text-sm text-[var(--foreground)] outline-none"
            />
          </div>
          <input
            required
            value={form.detalleUsuario.nombres}
            onChange={(event) =>
              setForm((currentForm) => ({
                ...currentForm,
                detalleUsuario: {
                  ...currentForm.detalleUsuario,
                  nombres: event.target.value,
                },
              }))
            }
            placeholder="Nombres"
            className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3 text-sm text-[var(--foreground)] outline-none"
          />
          <input
            required
            value={form.detalleUsuario.apellidos}
            onChange={(event) =>
              setForm((currentForm) => ({
                ...currentForm,
                detalleUsuario: {
                  ...currentForm.detalleUsuario,
                  apellidos: event.target.value,
                },
              }))
            }
            placeholder="Apellidos"
            className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3 text-sm text-[var(--foreground)] outline-none"
          />
          <input
            required
            value={form.detalleUsuario.dni}
            onChange={(event) =>
              setForm((currentForm) => ({
                ...currentForm,
                detalleUsuario: {
                  ...currentForm.detalleUsuario,
                  dni: event.target.value,
                },
              }))
            }
            placeholder="DNI"
            className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3 text-sm text-[var(--foreground)] outline-none"
          />
          <input
            required
            type="date"
            value={form.detalleUsuario.fechaNac}
            onChange={(event) =>
              setForm((currentForm) => ({
                ...currentForm,
                detalleUsuario: {
                  ...currentForm.detalleUsuario,
                  fechaNac: event.target.value,
                },
              }))
            }
            className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3 text-sm text-[var(--foreground)] outline-none"
          />
        </div>

        {canManageUserRoles && availableRoles.length > 0 ? (
          <div className="space-y-3">
            <div>
              <h2 className="text-sm font-semibold text-[var(--foreground)]">
                Roles iniciales
              </h2>
              <p className="text-sm text-[var(--muted)]">
                Selecciona los roles que se asignarán al crear el usuario.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {availableRoles.map((role) => (
                <label
                  key={role.id}
                  className="app-card-muted flex items-start gap-3 rounded-2xl px-4 py-3 text-sm text-[var(--foreground)]"
                >
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role.name)}
                    onChange={() => toggleRole(role.name)}
                    className="mt-1"
                  />
                  <span>{role.name}</span>
                </label>
              ))}
            </div>
          </div>
        ) : null}

        {rolesCatalogError ? (
          <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
            {rolesCatalogError}
          </p>
        ) : null}

        {formError ? (
          <p className="app-alert-error rounded-2xl px-4 py-3 text-sm">
            {formError}
          </p>
        ) : null}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="app-button-primary rounded-2xl px-4 py-3 text-sm font-semibold disabled:opacity-60"
          >
            {isSaving ? "Guardando..." : "Crear usuario"}
          </button>
        </div>
      </form>
    </section>
  );
}
