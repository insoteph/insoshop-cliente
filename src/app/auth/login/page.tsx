"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import { LoginForm, type AuthStep } from "@/modules/auth/components/LoginForm";

export default function LoginPage() {
  const [authStep, setAuthStep] = useState<AuthStep>("credentials");
  const isPasswordStep = authStep === "new-password";

  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-4 py-3 sm:min-h-screen sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="login-background" aria-hidden="true">
        <span className="login-ring login-ring-primary" />
        <span className="login-ring login-ring-secondary" />
        <span className="login-dots login-dots-left" />
        <span className="login-dots login-dots-right" />
      </div>

      <div className="absolute left-1/2 top-1/2 z-10 grid max-h-[calc(100dvh-1rem)] w-[min(100%,24rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[1.75rem] border border-white/50 bg-[color:var(--panel-strong)] shadow-[var(--shadow)] backdrop-blur-xl sm:static sm:max-h-none sm:w-[min(100%,30rem)] sm:translate-x-0 sm:translate-y-0 sm:rounded-[2rem] lg:h-[36rem] lg:w-full lg:max-w-[56rem] lg:grid-cols-2 lg:overflow-hidden">
        <section
          aria-label="Resumen visual de InsoShop"
          className={`relative hidden overflow-hidden bg-[#1d4ed8] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] lg:block ${
            isPasswordStep ? "lg:translate-x-full" : "lg:translate-x-0"
          }`}
        >
          <Image
            src="/assets/bg-img.png"
            alt="Decoración InsoShop"
            fill
            sizes="(min-width: 1024px) 50vw, 0vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#1d4ed8]/95 via-[#2563eb]/75 to-[#0ea5e9]/30" />
          <div className="absolute inset-8 rounded-[1.5rem] border border-white/20 bg-white/10 shadow-2xl backdrop-blur-[2px]" />
          <div className="absolute left-10 right-10 top-10 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-lg">
                <Image
                  src="/assets/logo.png"
                  alt=""
                  width={38}
                  height={38}
                  className="h-9 w-9 object-contain"
                />
              </span>
              <span className="text-sm font-semibold uppercase tracking-[0.28em] text-white/80">
                InsoShop
              </span>
            </div>
            <span className="rounded-full border border-white/30 px-3 py-1 text-xs font-medium text-white/80">
              Panel Admin
            </span>
          </div>
          <div className="absolute inset-x-12 bottom-14 text-white">
            <p className="max-w-md text-5xl font-black leading-[1.03]">
              Gestiona tu tienda desde un solo lugar
            </p>
            <p className="mt-5 max-w-sm text-base leading-7 text-white/80">
              Accede al panel para administrar productos, ventas y operaciones
              de tu catálogo.
            </p>
          </div>
          <span className="login-panel-ring login-panel-ring-lg" />
          <span className="login-panel-ring login-panel-ring-sm" />
        </section>

        <div
          className={`relative flex min-h-0 flex-col items-center justify-center px-4 py-2 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-8 sm:py-8 lg:min-h-0 lg:px-10 lg:py-0 ${
            isPasswordStep ? "lg:-translate-x-[108%]" : "lg:translate-x-0"
          }`}
        >
          <section className="mt-0 flex w-full max-w-[24rem] flex-col sm:max-w-[29rem] lg:mt-0 lg:justify-center">
            <span className="mb-1 inline-flex w-fit items-center rounded-full border border-[var(--line)] bg-[color:var(--panel-muted)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
              Acceso seguro
            </span>
            <h1 className="text-[1.7rem] font-black tracking-normal text-[var(--foreground-strong)] sm:text-4xl lg:text-[2.35rem]">
              {isPasswordStep ? "Cambiar contraseña" : "Iniciar Sesión"}
            </h1>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)] lg:max-w-[24rem]">
              {isPasswordStep
                ? "Define una nueva contraseña para finalizar el acceso"
                : "Ingresa tus credenciales para continuar"}
            </p>
            <div className="app-divider my-2 w-full border-t sm:my-7" />
            <Suspense fallback={null}>
              <LoginForm onStepChange={setAuthStep} />
            </Suspense>
          </section>
        </div>
      </div>
    </main>
  );
}
