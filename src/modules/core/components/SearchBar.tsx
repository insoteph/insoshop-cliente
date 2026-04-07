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
      className={`shadow-sm bg-white border-[1px] border-slate-200 w-full rounded-md border  px-4 py-3 text-sm text-slate-600 outline-none ${className ?? ""}`}
    />
  );
}
