type TitleBarProps = {
  title: string;
  status?: boolean;
};

export function TitleBar({ title, status }: TitleBarProps) {
  const showStatus = typeof status === "boolean";
  const statusLabel = status ? "Activo" : "Inactivo";
  const statusIconPath = status ? "/icons/check.svg" : "/icons/cross.svg";
  const statusClasses = status
    ? "bg-emerald-100 text-emerald-700"
    : "bg-red-100 text-red-700";

  return (
    <div className="rounded-md border border-[var(--line)] bg-[var(--panel)] px-4 py-3 shadow-md">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold text-slate-700">{title}</h2>
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
