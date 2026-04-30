"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";

import { useToast } from "@/modules/core/providers/ToastProvider";
import {
  fetchPermissionsCatalog,
  fetchRolePermissions,
  syncRolePermissions,
  updateRole,
} from "@/modules/roles/services/roles-service";
import type { RoleListItem } from "@/modules/roles/types/roles-types";
import {
  buildPermissionGroups,
  dedupePermissionValues,
} from "@/modules/roles/mappers/roles-permissions.mapper";

type EditingRole = {
  id: string;
  name: string;
} | null;

type UseRoleEditorProps = {
  canManagePermissions: boolean;
  onRoleSelected: (role: RoleListItem) => void;
  onRoleUpdated: (role: RoleListItem) => Promise<void> | void;
};

const FORM_ANIMATION_MS = 400;

export function useRoleEditor({
  canManagePermissions,
  onRoleSelected,
  onRoleUpdated,
}: UseRoleEditorProps) {
  const toast = useToast();
  const closeEditFormTimeoutRef = useRef<number | null>(null);

  const [permissionsCatalog, setPermissionsCatalog] = useState<string[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<EditingRole>(null);
  const [editingName, setEditingName] = useState("");
  const [editingPermissions, setEditingPermissions] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditFormMounted, setIsEditFormMounted] = useState(false);
  const [isEditFormVisible, setIsEditFormVisible] = useState(false);

  const resetEditForm = useCallback(() => {
    setEditingRole(null);
    setEditingName("");
    setEditingPermissions([]);
    setFormError(null);
  }, []);

  const clearCloseEditFormTimeout = useCallback(() => {
    if (closeEditFormTimeoutRef.current) {
      window.clearTimeout(closeEditFormTimeoutRef.current);
      closeEditFormTimeoutRef.current = null;
    }
  }, []);

  const openEditFormPanel = useCallback(() => {
    clearCloseEditFormTimeout();
    setIsEditFormMounted(true);
    window.requestAnimationFrame(() => {
      setIsEditFormVisible(true);
    });
  }, [clearCloseEditFormTimeout]);

  const closeEditFormPanel = useCallback(
    (shouldReset = true) => {
      setIsEditFormVisible(false);
      clearCloseEditFormTimeout();
      closeEditFormTimeoutRef.current = window.setTimeout(() => {
        setIsEditFormMounted(false);
        if (shouldReset) {
          resetEditForm();
        }
      }, FORM_ANIMATION_MS);
    },
    [clearCloseEditFormTimeout, resetEditForm],
  );

  useEffect(() => {
    return () => {
      clearCloseEditFormTimeout();
    };
  }, [clearCloseEditFormTimeout]);

  useEffect(() => {
    if (!canManagePermissions) {
      setPermissionsCatalog([]);
      setCatalogError(null);
      return;
    }

    async function loadCatalog() {
      setCatalogError(null);

      try {
        const result = await fetchPermissionsCatalog();
        setPermissionsCatalog(dedupePermissionValues(result));
      } catch (loadError) {
        setCatalogError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudo cargar el catálogo de permisos.",
        );
      }
    }

    void loadCatalog();
  }, [canManagePermissions]);

  const toggleEditingPermission = useCallback((permissionValue: string) => {
    setEditingPermissions((currentPermissions) =>
      currentPermissions.includes(permissionValue)
        ? currentPermissions.filter(
            (currentPermission) => currentPermission !== permissionValue,
          )
        : [...currentPermissions, permissionValue],
    );
  }, []);

  const selectAllEditingPermissions = useCallback(() => {
    setEditingPermissions(permissionsCatalog);
  }, [permissionsCatalog]);

  const clearEditingPermissions = useCallback(() => {
    setEditingPermissions([]);
  }, []);

  const handleEditRole = useCallback(
    async (role: RoleListItem) => {
      setFormError(null);
      setFormMessage(null);
      setEditingRole({
        id: role.id,
        name: role.name,
      });
      setEditingName(role.name);
      onRoleSelected(role);

      if (!canManagePermissions) {
        setEditingPermissions([]);
        openEditFormPanel();
        return;
      }

      try {
        const rolePermissions = await fetchRolePermissions(role.id);
        setEditingPermissions(
          dedupePermissionValues(
            rolePermissions.map((permissionItem) => permissionItem.claimValue),
          ),
        );
        openEditFormPanel();
      } catch (loadError) {
        setFormError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudieron cargar los permisos del rol.",
        );
        openEditFormPanel();
      }
    },
    [canManagePermissions, onRoleSelected, openEditFormPanel],
  );

  const handleSubmitEdit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!editingRole) {
        return;
      }

      setFormError(null);
      setFormMessage(null);

      if (!editingName.trim()) {
        setFormError("El nombre del rol es obligatorio.");
        return;
      }

      setIsSaving(true);

      try {
        await updateRole({
          roleId: editingRole.id,
          name: editingName.trim(),
        });

        if (canManagePermissions) {
          const currentPermissions = (
            await fetchRolePermissions(editingRole.id)
          ).map((permissionItem) => permissionItem.claimValue);

          await syncRolePermissions({
            roleId: editingRole.id,
            currentPermissions,
            nextPermissions: editingPermissions,
          });
        }

        const updatedRole = {
          id: editingRole.id,
          name: editingName.trim(),
        };

        await onRoleUpdated(updatedRole);
        setFormMessage("Rol actualizado correctamente.");
        toast.success("Rol editado correctamente.", "Rol");
        closeEditFormPanel(true);
      } catch (saveError) {
        setFormError(
          saveError instanceof Error
            ? saveError.message
            : "No se pudo actualizar el rol.",
        );
      } finally {
        setIsSaving(false);
      }
    },
    [
      canManagePermissions,
      closeEditFormPanel,
      editingRole,
      editingName,
      editingPermissions,
      onRoleUpdated,
      toast,
    ],
  );

  const permissionGroups = useMemo(
    () => buildPermissionGroups(permissionsCatalog),
    [permissionsCatalog],
  );

  return {
    permissionsCatalog,
    catalogError,
    editingRoleId: editingRole?.id ?? null,
    editingName,
    editingPermissions,
    formError,
    formMessage,
    isSaving,
    isEditFormMounted,
    isEditFormVisible,
    permissionGroups,
    handleEditRole,
    handleSubmitEdit,
    openEditFormPanel,
    closeEditFormPanel,
    resetEditForm,
    toggleEditingPermission,
    selectAllEditingPermissions,
    clearEditingPermissions,
    setEditingName,
  };
}
