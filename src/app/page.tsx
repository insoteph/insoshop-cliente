"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { getAccessToken } from "@/modules/auth/lib/session";
import { ensureSession } from "@/modules/auth/services/session-service";

type SessionState = "loading" | "authenticated" | "anonymous";

export default function Home() {
  const [sessionState, setSessionState] = useState<SessionState>("loading");

  useEffect(() => {
    let isMounted = true;

    async function resolveSession() {
      if (getAccessToken()) {
        if (isMounted) {
          setSessionState("authenticated");
        }
        return;
      }

      const hasSession = await ensureSession();

      if (isMounted) {
        setSessionState(hasSession ? "authenticated" : "anonymous");
      }
    }

    void resolveSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const primaryHref = useMemo(
    () => (sessionState === "authenticated" ? "/dashboard" : "/auth/login?next=%2Fdashboard"),
    [sessionState],
  );

  const primaryLabel = useMemo(
    () => (sessionState === "authenticated" ? "Ir al panel" : "Iniciar sesión"),
    [sessionState],
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#eef4ff_42%,#ffffff_100%)] px-4 py-6 text-[var(--foreground)] sm:px-6 lg:px-10 lg:py-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(29,78,216,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.10),transparent_26%),linear-gradient(180deg,transparent,rgba(255,255,255,0.45))]"
      />

      <section className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl flex-col justify-between overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <header className="flex items-center justify-between px-5 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--accent-soft)] shadow-sm">
              <Image
                src="/assets/logo.png"
                alt="InsoShop"
                width={34}
                height={34}
                className="h-8 w-8 object-contain"
                priority
              />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                InsoShop
              </p>
              <p className="text-sm text-[var(--muted)]">
                Plataforma de administración para tiendas
              </p>
            </div>
          </div>

          <Link
            href={primaryHref}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--accent-strong)]"
          >
            {primaryLabel}
          </Link>
        </header>

        <div className="grid flex-1 items-center gap-10 px-5 pb-8 pt-2 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-12 lg:pb-12 lg:pt-0">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-lg border border-[rgba(29,78,216,0.12)] bg-[rgba(29,78,216,0.06)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
              Landing pública
            </span>

            <h1 className="mt-5 max-w-2xl text-5xl font-black leading-[0.96] tracking-tight text-[var(--foreground-strong)] sm:text-6xl lg:text-[5.25rem]">
              Gestiona tu ecosistema de tiendas con una sola plataforma.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--muted)] sm:text-lg">
              InsoShop centraliza la administración de tiendas, productos,
              ventas y usuarios con una arquitectura pensada para crecer por
              subdominios, sin duplicar responsabilidades.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={primaryHref}
                className="rounded-lg bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--accent-strong)]"
              >
                {primaryLabel}
              </Link>
              <Link
                href="/auth/login"
                className="rounded-lg border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground-strong)] shadow-sm transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                Ver acceso
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-[var(--line)] bg-white px-4 py-4 shadow-sm">
                <p className="text-sm font-semibold text-[var(--foreground-strong)]">
                  Multi-tienda
                </p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                  Cada tienda vive en su propio subdominio.
                </p>
              </div>
              <div className="rounded-xl border border-[var(--line)] bg-white px-4 py-4 shadow-sm">
                <p className="text-sm font-semibold text-[var(--foreground-strong)]">
                  Sesión unificada
                </p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                  Un login para moverte entre contextos autorizados.
                </p>
              </div>
              <div className="rounded-xl border border-[var(--line)] bg-white px-4 py-4 shadow-sm">
                <p className="text-sm font-semibold text-[var(--foreground-strong)]">
                  Panel modular
                </p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                  Componentes desacoplados para escalar sin romper.
                </p>
              </div>
            </div>
          </div>

          <aside className="relative overflow-hidden rounded-[1.75rem] border border-[rgba(148,163,184,0.22)] bg-[linear-gradient(180deg,#0f172a_0%,#1d4ed8_52%,#0ea5e9_100%)] p-6 text-white shadow-[0_24px_60px_rgba(29,78,216,0.28)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.10),transparent_32%)]" />
            <div className="relative space-y-6">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
                  Contexto actual
                </p>
                <p className="mt-2 text-2xl font-black leading-tight">
                  {sessionState === "authenticated"
                    ? "Sesión detectada"
                    : sessionState === "anonymous"
                      ? "Acceso pendiente"
                      : "Verificando sesión"}
                </p>
                <p className="mt-2 text-sm leading-6 text-white/75">
                  {sessionState === "authenticated"
                    ? "Puedes entrar directamente al panel administrativo."
                    : sessionState === "anonymous"
                      ? "Si ya tienes cuenta, inicia sesión para abrir el panel."
                      : "Estamos validando tu sesión antes de mostrar el acceso correcto."}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-sm font-semibold">Subdominios</p>
                  <p className="mt-1 text-sm text-white/75">
                    Una tienda, un dominio, un contexto.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-sm font-semibold">Ruta base</p>
                  <p className="mt-1 text-sm text-white/75">
                    El panel siempre vive bajo <span className="font-semibold">/admin</span>.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
                  Acción principal
                </p>
                <Link
                  href={primaryHref}
                  className="mt-3 inline-flex rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[var(--accent)] transition hover:bg-[rgba(255,255,255,0.92)]"
                >
                  {primaryLabel}
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
