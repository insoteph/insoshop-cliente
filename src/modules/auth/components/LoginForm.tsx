import { MaterialInput } from "@/modules/core/components/MaterialInput";

export function LoginForm() {
  return (
    <form className="w-full max-w-md space-y-5">
      <MaterialInput id="email" type="email" label="Usuario" required />

      <div className="space-y-2">
        <MaterialInput
          id="password"
          type="password"
          label="Contraseña"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-md bg-blue-600 py-2 text-sm font-bold text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 active:scale-[0.98]"
      >
        Iniciar sesión
      </button>
    </form>
  );
}
