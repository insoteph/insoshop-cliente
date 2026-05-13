"use client";

import { useCallback, useEffect, useState } from "react";

import type { StoreModuleTabId } from "@/modules/core/components/StoreModuleTabs";

const STORAGE_PREFIX = "insoshop.store-admin.active-tab";

function buildStorageKey(storeId: number) {
  return `${STORAGE_PREFIX}:${storeId}`;
}

function readStoredTab(storeId: number): StoreModuleTabId | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedTab = window.localStorage.getItem(buildStorageKey(storeId));

    return storedTab ? (storedTab as StoreModuleTabId) : null;
  } catch {
    return null;
  }
}

function persistTab(storeId: number, tab: StoreModuleTabId) {
  try {
    window.localStorage.setItem(buildStorageKey(storeId), tab);
  } catch {
    // Ignore storage failures and keep the UI working.
  }
}

type UseStoreModuleTabStateParams = {
  storeId: number;
  visibleTabs: StoreModuleTabId[];
  initialTab?: StoreModuleTabId;
};

export function useStoreModuleTabState({
  storeId,
  visibleTabs,
  initialTab = "informacion",
}: UseStoreModuleTabStateParams) {
  const [storedTab, setStoredTab] = useState<StoreModuleTabId>(() => {
    return readStoredTab(storeId) ?? initialTab;
  });

  const activeTab = visibleTabs.includes(storedTab)
    ? storedTab
    : visibleTabs[0] ?? initialTab;

  const setActiveTab = useCallback((tab: StoreModuleTabId) => {
    setStoredTab(tab);
  }, []);

  useEffect(() => {
    if (visibleTabs.includes(activeTab)) {
      persistTab(storeId, activeTab);
    }
  }, [activeTab, storeId, visibleTabs]);

  return {
    activeTab,
    setActiveTab,
  };
}
