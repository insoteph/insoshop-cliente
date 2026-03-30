import type { InputHTMLAttributes } from "react";

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
  return (
    <div className={`relative ${containerClassName}`}>
      <input
        id={id}
        name={name ?? id}
        type={type}
        placeholder=" "
        className={`
          peer h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 
          text-sm text-zinc-800 outline-none transition-all duration-200 
         
          focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10
          ${className}
        `}
        {...rest}
      />
      <label
        htmlFor={id}
        className="
          pointer-events-none absolute left-2 px-1 transition-all duration-200

          bg-white
          
          
          top-0 -translate-y-1/2 text-[11px] font-medium text-blue-600
          
          peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 
          peer-placeholder-shown:text-sm peer-placeholder-shown:text-zinc-400
          
          peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-[11px] peer-focus:text-blue-500
        "
      >
        {label}
      </label>
    </div>
  );
}
