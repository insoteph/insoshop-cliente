"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { PaisesManagementView } from "@/modules/paises/components/PaisesManagementView";
import { useAdminSession } from "@/modules/auth/providers/AdminSessionProvider";

export default function PaisesPage() {
  const router = useRouter();
  const { currentUser, isLoading } = useAdminSession();

  useEffect(() => {
    if (isLoading || !currentUser) {
      return;
    }

    if (!currentUser.tieneAccesoGlobal) {
      router.replace("/admin");
    }
  }, [currentUser, isLoading, router]);

  if (isLoading || !currentUser) {
    return (
      <section className="panel-card">
        <p className="text-sm text-[var(--muted)]">
          Cargando administracion de paises...
        </p>
      </section>
    );
  }

  if (!currentUser.tieneAccesoGlobal) {
    return (
      <section className="panel-card">
        <p className="text-sm text-[var(--muted)]">
          Redirigiendo al panel principal...
        </p>
      </section>
    );
  }

  return <PaisesManagementView />;
}
