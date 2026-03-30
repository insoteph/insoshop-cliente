export function LoginForm() {
  return (
    <form className="w-full space-y-6" noValidate>
      {/* Campo Email */}
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block px-1 text-[14px] font-semibold text-zinc-700"
        >
          Correo Electrónico
        </label>
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Ingresa tu correo electrónico"
            className="w-full rounded-2xl border-none bg-[#f8faff] py-4 pl-12 pr-4 text-sm text-zinc-800 outline-none ring-1 ring-zinc-100 transition focus:ring-2 focus:ring-blue-500/40"
          />
        </div>
      </div>

      {/* Campo Contraseña */}
      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block px-1 text-[14px] font-semibold text-zinc-700"
        >
          Contraseña
        </label>
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Ingresa tu contraseña"
            className="w-full rounded-2xl border-none bg-[#f8faff] py-4 pl-12 pr-12 text-sm text-zinc-800 outline-none ring-1 ring-zinc-100 transition focus:ring-2 focus:ring-blue-500/40"
          />
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>
        <div className="text-right">
          <button
            type="button"
            className="text-[13px] font-semibold text-blue-600 hover:text-blue-700"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      </div>

      {/* Botón Iniciar Sesión */}
      <button
        type="submit"
        className="w-full rounded-2xl bg-blue-600 py-4 text-sm font-bold text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 active:scale-[0.98]"
      >
        Iniciar Sesión
      </button>
    </form>
  );
}
