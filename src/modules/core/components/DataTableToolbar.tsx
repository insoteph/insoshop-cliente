export type DataTableToolbarAction = {
  label: string;
  onClick: () => void;
  iconPath?: string;
};

type DataTableToolbarProps = {
  pageSize: number;
  onPageSizeChange: (value: number) => void;
  pageSizeOptions?: number[];
  className?: string;
};

type ToolbarActionsProps = {
  actions?: DataTableToolbarAction[];
  className?: string;
};

export function ToolbarActions({ actions = [], className }: ToolbarActionsProps) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      {actions.map((action, index) => (
        <button
          key={`${action.label}-${index}`}
          type="button"
          onClick={action.onClick}
          className="app-button-primary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium"
        >
          <span
            aria-hidden="true"
            className="h-4 w-4 bg-current"
            style={{
              WebkitMaskImage: `url(${action.iconPath ?? "/icons/cross.svg"})`,
              maskImage: `url(${action.iconPath ?? "/icons/cross.svg"})`,
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskPosition: "center",
              WebkitMaskSize: "contain",
              maskSize: "contain",
            }}
          />
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
}

export function DataTableToolbar({
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  className,
}: DataTableToolbarProps) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-xl bg-transparent px-4 py-2 md:flex-row md:items-center md:justify-between ${className ?? ""}`}
    >
      <label className="inline-flex items-center gap-2 text-sm text-[var(--foreground)]">
        <span className="font-medium text-[var(--muted)]">Mostrar:</span>
        <select
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className="app-input rounded-xl px-3 py-2 text-sm font-bold"
          aria-label="Cantidad de elementos por pagina"
        >
          {pageSizeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
