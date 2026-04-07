type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  name?: string;
  ariaLabel?: string;
};

export function SearchBar({
  value,
  onChange,
  placeholder = "Buscar...",
  className,
  name = "search",
  ariaLabel = "Buscar",
}: SearchBarProps) {
  return (
    <div className="relative w-full">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        style={{
          WebkitMaskImage: "url(/icons/lupa.svg)",
          maskImage: "url(/icons/lupa.svg)",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          WebkitMaskSize: "contain",
          maskSize: "contain",
          backgroundColor: "currentColor",
        }}
      />
      <input
        type="search"
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={`w-full rounded-md border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-600 shadow-sm outline-none placeholder:text-slate-400 ${className ?? ""}`}
      />
    </div>
  );
}
