"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAdminSession } from "@/modules/auth/providers/AdminSessionProvider";
import { ensureSession } from "@/modules/auth/services/session-service";
import { ProcessingModal } from "@/modules/core/components/ProcessingModal";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, isLoading } = useAdminSession();
  const [isChecking, setIsChecking] = useState(true);
  const didRedirectRef = useRef(false);

  const redirectToLogin = useCallback(() => {
    if (didRedirectRef.current) {
      return;
    }

    didRedirectRef.current = true;

    const nextParam = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
    router.replace(`/auth/login${nextParam}`);
    setIsChecking(false);
  }, [pathname, router]);

  useEffect(() => {
    let isMounted = true;

    async function validateSession() {
      if (pathname.startsWith("/auth")) {
        if (isMounted) {
          setIsChecking(false);
        }
        return;
      }

      if (currentUser) {
        if (isMounted) {
          setIsChecking(false);
        }
        return;
      }

      if (isLoading) {
        return;
      }

      try {
        const hasSession = await ensureSession();

        if (!isMounted) {
          return;
        }

        if (!hasSession) {
          redirectToLogin();
          return;
        }

        setIsChecking(false);
      } catch {
        if (!isMounted) {
          return;
        }

        redirectToLogin();
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
  }, [currentUser, isLoading, pathname, redirectToLogin]);

  if (isChecking || (isLoading && !currentUser)) {
    return <ProcessingModal isOpen label="Procesando..." />;
  }

  return <>{children}</>;
}
