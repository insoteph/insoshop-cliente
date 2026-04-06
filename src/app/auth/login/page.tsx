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

      <div className="relative z-10 rounded-2xl overflow-hidden md:w-1/2 lg:flex lg:h-[58vh] lg:min-h-[600px] lg:flex-row lg:items-center lg:bg-white/85 lg:backdrop-blur-sm lg:border  lg:shadow-xl border-none">
        <section
          id="section-left"
          className="relative hidden lg:block lg:w-1/2 lg:self-stretch border-solid border-white border-8 overflow-hidden"
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

          <section className="shadow-md p-10 justify-end items-center flex flex-col space-y-3 bg-white lg:bg-none lg:rounded-none lg:shadow-none  rounded-2xl">
            <span className="text-sky-600 text-2xl font-bold">
              Iniciar Sesión
            </span>
            <span className="p-0 text-slate-500 text-sm">
              Ingresa tus credenciales para continuar
            </span>
            <div className="my-2 w-full border-t border-slate-200" />
            <Suspense fallback={null}>
              <LoginForm />
            </Suspense>
          </section>
        </div>
      </div>
    </main>
  );
}
