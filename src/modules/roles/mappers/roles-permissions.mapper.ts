"use client";

import type { RolePermission } from "@/modules/roles/types/roles-types";

export type PermissionGroup = {
  label: string;
  items: string[];
};

export function buildPermissionGroups(items: string[]): PermissionGroup[] {
  const groups = new Map<string, string[]>();

  for (const permission of items) {
    const [groupLabel = "General"] = permission.split(".");
    const groupItems = groups.get(groupLabel) ?? [];
    groupItems.push(permission);
    groups.set(groupLabel, groupItems);
  }

  return Array.from(groups.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([label, groupItems]) => ({
      label,
      items: groupItems.sort((left, right) => left.localeCompare(right)),
    }));
}

export function dedupePermissionValues(items: string[]) {
  return Array.from(new Set(items));
}

export function dedupeRolePermissions(items: RolePermission[]) {
  const uniquePermissions = new Map<string, RolePermission>();

  for (const item of items) {
    const key = `${item.claimType}:${item.claimValue}`;

    if (!uniquePermissions.has(key)) {
      uniquePermissions.set(key, item);
    }
  }

  return Array.from(uniquePermissions.values());
}
