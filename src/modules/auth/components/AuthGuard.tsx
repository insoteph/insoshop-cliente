"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { ensureSession } from "@/modules/auth/services/session-service";
import { ProcessingModal } from "@/modules/core/components/ProcessingModal";
import { useStoreContext } from "@/modules/stores/context/StoreContext";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { refreshStores } = useStoreContext();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function validateSession() {
      try {
        const hasSession = await ensureSession();

        if (!isMounted) {
          return;
        }

        if (!hasSession) {
          const nextParam = pathname
            ? `?next=${encodeURIComponent(pathname)}`
            : "";
          const loginPath = `/auth/login${nextParam}`;
          router.replace(loginPath);

          if (typeof window !== "undefined") {
            window.setTimeout(() => {
              window.location.replace(loginPath);
            }, 250);
          }

          return;
        }

        await refreshStores();
      } catch {
        if (!isMounted) {
          return;
        }

        const nextParam = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
        router.replace(`/auth/login${nextParam}`);
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    }

    void validateSession();

    return () => {
      isMounted = false;
    };
  }, [pathname, refreshStores, router]);

  if (isChecking) {
    return <ProcessingModal isOpen label="Procesando..." />;
  }

  return <>{children}</>;
}
