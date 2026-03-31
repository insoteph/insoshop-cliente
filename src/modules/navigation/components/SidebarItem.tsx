"use client";

import type { ReactNode } from "react";
import Link from "next/link";

type SidebarItemProps = {
  href: string;
  label: string;
  icon: ReactNode;
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
  return (
    <Link
      href={href}
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`sidebar-item ${active ? "sidebar-item-active" : ""} ${collapsed ? "sidebar-item-collapsed" : ""}`}
    >
      <span className="sidebar-icon">{icon}</span>
      <span className={`sidebar-label ${collapsed ? "sidebar-label-hidden" : ""}`}>
        {label}
      </span>
    </Link>
  );
}
