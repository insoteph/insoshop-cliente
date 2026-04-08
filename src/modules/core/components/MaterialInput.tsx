import { useState, type InputHTMLAttributes } from "react";

type MaterialInputType = "text" | "email" | "password" | "tel" | "number";

type MaterialInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  id: string;
  label: string;
  type?: MaterialInputType;
  containerClassName?: string;
};

export function MaterialInput({
  id,
  name,
  label,
  type = "text",
  className = "",
  containerClassName = "",
  ...rest
}: MaterialInputProps) {
  const isPasswordType = type === "password";
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const resolvedType =
    isPasswordType && isPasswordVisible ? "text" : type;

  return (
    <div className={`relative ${containerClassName}`}>
      <input
        autoComplete="false"
        id={id}
        name={name ?? id}
        type={resolvedType}
        placeholder=" "
        className={`
          app-input peer h-11 w-full rounded-xl px-3
          text-sm outline-none transition-all duration-200
          ${isPasswordType ? "pr-10" : ""}
          ${className}
        `}
        {...rest}
      />
      {isPasswordType ? (
        <button
          type="button"
          onClick={() => setIsPasswordVisible((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
          aria-label={isPasswordVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
          title={isPasswordVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {isPasswordVisible ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M3 3l18 18" />
              <path d="M10.58 10.58a2 2 0 102.83 2.83" />
              <path d="M9.88 5.09A9.77 9.77 0 0112 5c5 0 9 4 10 7a11.8 11.8 0 01-4.21 5.17" />
              <path d="M6.61 6.61A11.8 11.8 0 002 12c1 3 5 7 10 7a9.77 9.77 0 004.12-.91" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      ) : null}
      <label
        htmlFor={id}
        className="
          pointer-events-none absolute left-2 px-1 transition-all duration-200
          bg-[var(--panel-strong)]
          top-0 -translate-y-1/2 text-[11px] font-medium text-[var(--accent)]
          peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 
          peer-placeholder-shown:text-sm peer-placeholder-shown:text-[var(--muted)]
          peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-[11px] peer-focus:text-[var(--accent)]
        "
      >
        {label}
      </label>
    </div>
  );
}
