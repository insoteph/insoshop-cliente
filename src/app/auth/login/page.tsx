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

      <div className="relative z-10 rounded-2xl overflow-hidden md:w-3/4 lg:flex lg:flex-row lg:items-center lg:bg-white lg:shadow-xl">
        <section id="section-left" className="hidden lg:block lg:w-1/2">
          <img className="" src="/assets/bg-img.jpg" alt="" />
        </section>

        <div
          id="section-right"
          className=" flex flex-col items-center justify-center space-y-7 lg:space-y-0 lg:w-1/2"
        >
          <section className="w-30 lg:w-20 overflow-hidden lg:hidden">
            <img src="/assets/logo.png" alt="Logo Insoshop" />
          </section>

          <section className="shadow-md p-10 justify-center items-center flex flex-col space-y-3 bg-white lg:bg-none lg:rounded-none lg:shadow-none  rounded-2xl">
            <h2 className="text-blue-800 text-2xl font-bold">
              Inicio de Sesión
            </h2>
            <span className="p-0 text-slate-500 text-sm">
              Ingresa tus credenciales para continuar
            </span>
            <LoginForm />
          </section>
        </div>
      </div>
    </main>
  );
}
