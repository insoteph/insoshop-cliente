import { LoginForm } from "@/modules/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <main className=" min-h-screen bg-blue-50 justify-center items-center flex">
      <div className="flex items-center justify-center bg-white md:w-3/4 rounded-2xl">
        <section className="hidden md:w-1/2">
          <img
            src="https://dmxmarketing.com/wp-content/uploads/2020/12/AdobeStock_241431868-1-scaled-1.jpeg"
            alt=""
          />
        </section>
        <section className="p-10 justify-center items-center flex flex-col space-y-3">
          <h2 className="text-blue-800 text-2xl font-bold">Inicio de Sesión</h2>
          <span className="p-0 text-slate-500 text-sm">
            Ingresa tus credenciales para continuar
          </span>
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
