"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { permissions } from "@/modules/auth/lib/permissions";
import { useAdminSession } from "@/modules/auth/providers/AdminSessionProvider";
import { useConfirmationDialog } from "@/modules/core/providers/ConfirmationDialogProvider";
import { useToast } from "@/modules/core/providers/ToastProvider";
import {
  deleteRole,
  fetchRolePermissions,
  fetchRoles,
} from "@/modules/roles/services/roles-service";
import type { RoleListItem, RolePermission } from "@/modules/roles/types/roles-types";
import { dedupeRolePermissions } from "@/modules/roles/mappers/roles-permissions.mapper";

type UseRolesListParams = {
  page: number;
  search: string;
  onPageCountChange: (result: { totalPages: number; totalRecords: number }) => void;
};

export function useRolesList({
  page,
  search,
  onPageCountChange,
}: UseRolesListParams) {
  const { confirm } = useConfirmationDialog();
  const toast = useToast();
  const { hasPermission } = useAdminSession();
  const canEditRole = hasPermission(permissions.roles.editar);
  const canDeleteRole = hasPermission(permissions.roles.eliminar);
  const canManagePermissions = hasPermission(permissions.permiso.gestionar);

  const [roles, setRoles] = useState<RoleListItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
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
        pageSize: 8,
        search,
      });

      setRoles(result.items);
      setTotalPages(result.totalPages);
      setTotalRecords(result.totalRecords);
      onPageCountChange({
        totalPages: result.totalPages,
        totalRecords: result.totalRecords,
      });
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudieron cargar los roles.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [onPageCountChange, page, search]);

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

  const handleDeleteRole = useCallback(
    async (role: RoleListItem, onDeleted?: () => void) => {
      const confirmed = await confirm({
        title: "Eliminar rol",
        description: `Se eliminara el rol "${role.name}".`,
        confirmLabel: "Eliminar",
        variant: "danger",
      });

      if (!confirmed) {
        return;
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
        onDeleted?.();
        toast.success("Rol eliminado correctamente.", "Rol");
        await loadRoles();
      } catch (deleteError) {
        setError(
          deleteError instanceof Error
            ? deleteError.message
            : "No se pudo eliminar el rol.",
        );
      } finally {
        setIsDeletingRoleId(null);
      }
    },
    [confirm, loadRoles, selectedRoleId, toast],
  );

  const handleSearchChange = useCallback((value: string) => {
    // handled by parent via query state
    return value;
  }, []);

  const handlePageChange = useCallback((nextPage: number) => nextPage, []);

  return {
    canEditRole,
    canDeleteRole,
    canManagePermissions,
    roles,
    totalPages,
    totalRecords,
    isLoading,
    error,
    selectedRoleId,
    selectedRoleName,
    selectedRolePermissions,
    isLoadingRolePermissions,
    rolePermissionsError,
    isDeletingRoleId,
    loadRoles,
    handleSelectRole,
    handleDeleteRole,
    handleSearchChange,
    handlePageChange,
  };
}
