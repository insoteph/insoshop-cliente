"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import { LoginForm, type AuthStep } from "@/modules/auth/components/LoginForm";

export default function LoginPage() {
  const [authStep, setAuthStep] = useState<AuthStep>("credentials");
  const isPasswordStep = authStep === "new-password";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <div className="login-background" aria-hidden="true">
        <span className="login-ball" />
        <span className="login-ball" />
        <span className="login-ball" />
        <span className="login-ball" />
        <span className="login-ball" />
        <span className="login-ball" />
      </div>

      <div className="relative z-10 w-[min(92vw,980px)] overflow-hidden rounded-[2rem] lg:h-[58vh] lg:min-h-[600px] lg:border lg:border-[var(--line)] lg:bg-[color:var(--panel)] lg:shadow-[var(--shadow)] lg:backdrop-blur-xl">
        <section
          id="section-left"
          className={`relative hidden overflow-hidden border-[10px] border-[color:var(--panel-strong)] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] lg:absolute lg:inset-y-0 lg:block lg:w-1/2 ${
            isPasswordStep
              ? "lg:left-0 lg:translate-x-full"
              : "lg:left-0 lg:translate-x-0"
          }`}
        >
          <Image
            src="/assets/bg-img.png"
            alt="Decoración InsoShop"
            fill
            sizes="(min-width: 1024px) 50vw, 0vw"
            className="object-cover rounded-l-2xl overflow-hidden"
            priority
          />
        </section>

        <div
          id="section-right"
          className={`flex flex-col items-center justify-center space-y-7 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] lg:absolute lg:inset-y-0 lg:w-1/2 lg:space-y-0 ${
            isPasswordStep
              ? "lg:right-0 lg:-translate-x-full"
              : "lg:right-0 lg:translate-x-0"
          }`}
        >
          <section className="w-30 lg:w-20 overflow-hidden lg:hidden">
            <Image
              src="/assets/logo.png"
              alt="Logo Insoshop"
              width={128}
              height={128}
              className="h-auto w-full object-contain"
              priority
            />
          </section>

          <section className="app-card flex w-full max-w-[30rem] flex-col items-center justify-end space-y-3 rounded-[1.75rem] p-8 sm:p-10 lg:bg-transparent lg:shadow-none lg:backdrop-blur-none">
            <span className="text-2xl font-bold text-[var(--accent)]">
              {isPasswordStep ? "Cambiar contraseña" : "Iniciar Sesión"}
            </span>
            <span className="p-0 text-sm text-[var(--muted)]">
              {isPasswordStep
                ? "Define una nueva contraseña para finalizar el acceso"
                : "Ingresa tus credenciales para continuar"}
            </span>
            <div className="app-divider my-2 w-full border-t" />
            <Suspense fallback={null}>
              <LoginForm onStepChange={setAuthStep} />
            </Suspense>
          </section>
        </div>
      </div>
    </main>
  );
}
