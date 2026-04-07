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
    <input
      type="search"
      name={name}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      aria-label={ariaLabel}
      className={`w-full rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3 text-sm text-[var(--foreground)] outline-none ${className ?? ""}`}
    />
  );
}
