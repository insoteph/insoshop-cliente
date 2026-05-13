import type { ReactNode } from "react";

type PanelSectionHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  headingLevel?: "h1" | "h2" | "h3" | "h4";
  className?: string;
};

export function PanelSectionHeader({
  title,
  subtitle,
  actions,
  headingLevel: HeadingTag = "h3",
  className,
}: PanelSectionHeaderProps) {
  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between ${className ?? ""}`}
    >
      <div className="min-w-0">
        <HeadingTag className="text-[15px] font-semibold text-[var(--foreground-strong)] sm:text-base">
          {title}
        </HeadingTag>
        {subtitle ? (
          <p className="mt-0.5 text-[13px] leading-5 text-[var(--muted)] sm:text-sm">
            {subtitle}
          </p>
        ) : null}
      </div>

      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
