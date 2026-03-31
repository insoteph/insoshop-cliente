"use client";

import type { CSSProperties } from "react";
import Link from "next/link";

type SidebarItemProps = {
  href: string;
  label: string;
  icon: string;
  active?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
};

export function SidebarItem({
  href,
  label,
  icon,
  active = false,
  collapsed = false,
  onClick,
}: SidebarItemProps) {
  const iconStyle = {
    "--sidebar-icon-url": `url("${icon}")`,
  } as CSSProperties;

  return (
    <Link
      href={href}
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`sidebar-item ${active ? "sidebar-item-active" : ""} ${collapsed ? "sidebar-item-collapsed" : ""}`}
    >
      <span className="sidebar-icon" aria-hidden="true">
        <span className="sidebar-icon-glyph" style={iconStyle} />
      </span>
      <span className={`sidebar-label ${collapsed ? "sidebar-label-hidden" : ""}`}>
        {label}
      </span>
    </Link>
  );
}
