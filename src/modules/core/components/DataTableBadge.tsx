import type { CSSProperties } from "react";

export type DataTableBadgeRule = {
  value: string | number | boolean;
  label: string;
  iconPath?: string;
  textClassName: string;
  backgroundClassName: string;
};

type DataTableBadgeProps = {
  label: string;
  iconPath?: string;
  textClassName: string;
  backgroundClassName: string;
};

function buildMaskStyle(iconPath: string): CSSProperties {
  return {
    WebkitMaskImage: `url(${iconPath})`,
    maskImage: `url(${iconPath})`,
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
    WebkitMaskSize: "contain",
    maskSize: "contain",
  };
}

export function DataTableBadge({
  label,
  iconPath,
  textClassName,
  backgroundClassName,
}: DataTableBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 font-medium ${textClassName} ${backgroundClassName}`}
    >
      {iconPath ? (
        <span
          aria-hidden="true"
          className="h-3 w-3 shrink-0 bg-current"
          style={buildMaskStyle(iconPath)}
        />
      ) : null}
      <span className="text-sm">{label}</span>
    </span>
  );
}
