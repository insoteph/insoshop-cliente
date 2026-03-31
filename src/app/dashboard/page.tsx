"use client";

import { useStoreContext } from "@/modules/stores/context/StoreContext";

export default function DashboardPage() {
  const { activeStore } = useStoreContext();

  return <section className="space-y-6"></section>;
}
