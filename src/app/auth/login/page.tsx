import { LoginForm } from "@/modules/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eef2ff] px-4 py-10">
      {/* El contenedor principal con bordes muy redondeados */}
      <section className="w-full max-w-md rounded-[2.5rem] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] md:p-12">
        <header className="mb-10 flex flex-col items-center text-center">
          {/* Logo Simulado */}
          <div className="mb-4 flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 shadow-md shadow-blue-200" />
            <span className="text-2xl font-bold tracking-tight text-[#1e293b]">
              insoShop
            </span>
          </div>

          <h1 className="text-3xl font-bold text-[#1e293b]">
            Iniciar Sesión
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-zinc-500">
            Por favor, introduce tus credenciales para acceder a tu cuenta a la
            vez.
          </p>
        </header>

        <LoginForm />

        <div className="mt-8 text-center text-sm font-medium text-zinc-500">
          ¿No tienes cuenta?{" "}
          <button className="text-blue-600 hover:underline">Regístrate</button>
        </div>
      </section>
    </main>
  );
}
