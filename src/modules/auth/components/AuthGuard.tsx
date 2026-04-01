"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  getAccessToken,
  getSessionCacheStatus,
} from "@/modules/auth/lib/session";
import { ensureSession } from "@/modules/auth/services/session-service";
import { ProcessingModal } from "@/modules/core/components/ProcessingModal";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const shouldValidateSession =
    getSessionCacheStatus() !== "authenticated" || !getAccessToken();
  const [isChecking, setIsChecking] = useState(shouldValidateSession);

  useEffect(() => {
    let isMounted = true;

    async function validateSession() {
      if (!shouldValidateSession) {
        return;
      }

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
  }, [pathname, router, shouldValidateSession]);

  if (isChecking) {
    return <ProcessingModal isOpen label="Procesando..." />;
  }

  return <>{children}</>;
}
