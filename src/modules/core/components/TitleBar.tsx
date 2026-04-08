type TitleBarProps = {
  title: string;
  status?: boolean;
};

export function TitleBar({ title, status }: TitleBarProps) {
  const showStatus = typeof status === "boolean";
  const statusLabel = status ? "Activo" : "Inactivo";
  const statusIconPath = status ? "/icons/check.svg" : "/icons/cross.svg";
  const statusClasses = status
    ? "app-badge-success"
    : "app-badge-danger";

  return (
    <div className="app-card rounded-2xl px-4 py-3">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold text-[var(--foreground-strong)]">
          {title}
        </h2>
        {showStatus ? (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses}`}
          >
            <span
              aria-hidden="true"
              className="h-3.5 w-3.5 bg-current"
              style={{
                WebkitMaskImage: `url(${statusIconPath})`,
                maskImage: `url(${statusIconPath})`,
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
                WebkitMaskSize: "contain",
                maskSize: "contain",
              }}
            />
            <span>{statusLabel}</span>
          </span>
        ) : null}
      </div>
    </div>
  );
}
