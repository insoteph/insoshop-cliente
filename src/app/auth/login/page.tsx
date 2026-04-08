import { Suspense } from "react";
import Image from "next/image";
import { LoginForm } from "@/modules/auth/components/LoginForm";

export default function LoginPage() {
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

      <div className="relative z-10 overflow-hidden rounded-[2rem] md:w-1/2 lg:flex lg:h-[58vh] lg:min-h-[600px] lg:flex-row lg:items-center lg:border lg:border-[var(--line)] lg:bg-[color:var(--panel)] lg:shadow-[var(--shadow)] lg:backdrop-blur-xl">
        <section
          id="section-left"
          className="relative hidden overflow-hidden border-[10px] border-[color:var(--panel-strong)] lg:block lg:w-1/2 lg:self-stretch"
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
          className=" flex flex-col items-center justify-center space-y-7 lg:space-y-0 lg:w-1/2"
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

          <section className="app-card flex flex-col items-center justify-end space-y-3 rounded-[1.75rem] p-10 lg:bg-transparent lg:shadow-none lg:backdrop-blur-none">
            <span className="text-2xl font-bold text-[var(--accent)]">
              Iniciar Sesión
            </span>
            <span className="p-0 text-sm text-[var(--muted)]">
              Ingresa tus credenciales para continuar
            </span>
            <div className="app-divider my-2 w-full border-t" />
            <Suspense fallback={null}>
              <LoginForm />
            </Suspense>
          </section>
        </div>
      </div>
    </main>
  );
}
