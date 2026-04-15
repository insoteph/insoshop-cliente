"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  getAccessToken,
  getSessionCacheStatus,
} from "@/modules/auth/lib/session";
import { useAdminSession } from "@/modules/auth/providers/AdminSessionProvider";
import { ensureSession } from "@/modules/auth/services/session-service";
import { ProcessingModal } from "@/modules/core/components/ProcessingModal";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, isLoading } = useAdminSession();
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

  useEffect(() => {
    if (pathname.startsWith("/auth")) {
      return;
    }

    if (isLoading) {
      return;
    }

    if (currentUser) {
      return;
    }

    const nextParam = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
    const loginPath = `/auth/login${nextParam}`;
    router.replace(loginPath);

    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        window.location.replace(loginPath);
      }, 100);
    }
  }, [currentUser, isLoading, pathname, router]);

  if (isChecking || (isLoading && !currentUser)) {
    return <ProcessingModal isOpen label="Procesando..." />;
  }

  return <>{children}</>;
}
