"use client";

import { useCallback, useEffect, useState } from "react";

import { permissions } from "@/modules/auth/lib/permissions";
import { useAdminSession } from "@/modules/auth/providers/AdminSessionProvider";
import { useConfirmationDialog } from "@/modules/core/providers/ConfirmationDialogProvider";
import { useToast } from "@/modules/core/providers/ToastProvider";
import {
  deleteRole,
  fetchRolePermissions,
  fetchRoles,
} from "@/modules/roles/services/roles-service";
import type {
  RoleListItem,
  RolePermission,
} from "@/modules/roles/types/roles-types";
import { dedupeRolePermissions } from "@/modules/roles/mappers/roles-permissions.mapper";

type UseRolesListManagementProps = {
  canManagePermissions: boolean;
};

const DEFAULT_PAGE_SIZE = 8;

export function useRolesListManagement({
  canManagePermissions,
}: UseRolesListManagementProps) {
  const { confirm } = useConfirmationDialog();
  const toast = useToast();
  const { hasPermission } = useAdminSession();

  const canCreateRole = hasPermission(permissions.roles.crear);
  const canEditRole = hasPermission(permissions.roles.editar);
  const canDeleteRole = hasPermission(permissions.roles.eliminar);

  const [roles, setRoles] = useState<RoleListItem[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [selectedRoleName, setSelectedRoleName] = useState("");
  const [selectedRolePermissions, setSelectedRolePermissions] = useState<
    RolePermission[]
  >([]);
  const [isLoadingRolePermissions, setIsLoadingRolePermissions] =
    useState(false);
  const [rolePermissionsError, setRolePermissionsError] = useState<
    string | null
  >(null);
  const [isDeletingRoleId, setIsDeletingRoleId] = useState<string | null>(null);

  const loadRoles = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchRoles({
        page,
        pageSize,
        search,
      });

      setRoles(result.items);
      setTotalPages(result.totalPages);
      setTotalRecords(result.totalRecords);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudieron cargar los roles.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    void loadRoles();
  }, [loadRoles]);

  useEffect(() => {
    if (roles.length === 0) {
      if (selectedRoleId !== null) {
        setSelectedRoleId(null);
      }
      if (selectedRoleName !== "") {
        setSelectedRoleName("");
      }
      return;
    }

    const currentRole =
      roles.find((role) => role.id === selectedRoleId) ?? roles[0];

    if (currentRole.id !== selectedRoleId) {
      setSelectedRoleId(currentRole.id);
    }

    if (currentRole.name !== selectedRoleName) {
      setSelectedRoleName(currentRole.name);
    }
  }, [roles, selectedRoleId, selectedRoleName]);

  useEffect(() => {
    if (!selectedRoleId || !canManagePermissions) {
      setSelectedRolePermissions([]);
      setRolePermissionsError(null);
      return;
    }

    const roleId = selectedRoleId;

    async function loadDetailPermissions() {
      setIsLoadingRolePermissions(true);
      setRolePermissionsError(null);

      try {
        const result = await fetchRolePermissions(roleId);
        setSelectedRolePermissions(dedupeRolePermissions(result));
      } catch (loadError) {
        setRolePermissionsError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudieron cargar los permisos del rol.",
        );
      } finally {
        setIsLoadingRolePermissions(false);
      }
    }

    void loadDetailPermissions();
  }, [canManagePermissions, selectedRoleId]);

  const handleSelectRole = useCallback((role: RoleListItem) => {
    setSelectedRoleId(role.id);
    setSelectedRoleName(role.name);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setPage(1);
    setSearch(value);
  }, []);

  const handlePageChange = useCallback((nextPage: number) => {
    setPage(nextPage);
  }, []);

  const handleDeleteRole = useCallback(
    async (role: RoleListItem) => {
      const confirmed = await confirm({
        title: "Eliminar rol",
        description: `Se eliminara el rol "${role.name}".`,
        confirmLabel: "Eliminar",
        variant: "danger",
      });

      if (!confirmed) {
        return false;
      }

      setError(null);
      setIsDeletingRoleId(role.id);

      try {
        await deleteRole(role.id);

        if (selectedRoleId === role.id) {
          setSelectedRoleId(null);
          setSelectedRoleName("");
          setSelectedRolePermissions([]);
        }

        toast.success("Rol eliminado correctamente.", "Rol");
        await loadRoles();
        return true;
      } catch (deleteError) {
        setError(
          deleteError instanceof Error
            ? deleteError.message
            : "No se pudo eliminar el rol.",
        );
        return false;
      } finally {
        setIsDeletingRoleId(null);
      }
    },
    [confirm, loadRoles, selectedRoleId, toast],
  );

  return {
    canCreateRole,
    canEditRole,
    canDeleteRole,
    roles,
    page,
    totalPages,
    totalRecords,
    search,
    isLoading,
    error,
    selectedRoleId,
    selectedRoleName,
    selectedRolePermissions,
    isLoadingRolePermissions,
    rolePermissionsError,
    isDeletingRoleId,
    refreshRoles: loadRoles,
    handleSelectRole,
    handleSearchChange,
    handlePageChange,
    handleDeleteRole,
  };
}
