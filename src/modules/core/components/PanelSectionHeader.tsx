import type { ReactNode } from "react";

type PanelSectionHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  headingLevel?: "h1" | "h2" | "h3" | "h4";
  titleId?: string;
  className?: string;
};

export function PanelSectionHeader({
  title,
  subtitle,
  actions,
  headingLevel: HeadingTag = "h3",
  titleId,
  className,
}: PanelSectionHeaderProps) {
  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between ${className ?? ""}`}
    >
      <div className="min-w-0">
        <HeadingTag
          id={titleId}
          className="text-[0.98rem] font-semibold tracking-tight text-[var(--foreground-strong)] sm:text-[1.05rem]"
        >
          {title}
        </HeadingTag>
        {subtitle ? (
          <p className="mt-1 text-[0.8rem] leading-5 text-[var(--muted)] sm:text-[0.85rem]">
            {subtitle}
          </p>
        ) : null}
      </div>

      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
