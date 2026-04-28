import type { PagedResult } from "@/modules/core/lib/api-client";

export type RoleListItem = {
  id: string;
  name: string;
};

export type RoleDetail = RoleListItem;

export type RolePermission = {
  id: number;
  claimType: string;
  claimValue: string;
};

export type RolesPageResult = PagedResult<RoleListItem>;

export type RolesQueryParams = {
  page?: number;
  pageSize?: number;
  search?: string;
};
