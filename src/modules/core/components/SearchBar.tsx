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
        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]"
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
        className={`app-input w-full rounded-xl py-3 pl-10 pr-4 text-sm shadow-sm ${className ?? ""}`}
      />
    </div>
  );
}
