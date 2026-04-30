"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAdminSession } from "@/modules/auth/providers/AdminSessionProvider";
import { ProcessingModal } from "@/modules/core/components/ProcessingModal";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, isLoading } = useAdminSession();
  const didRedirectRef = useRef(false);
  const isAuthRoute = pathname.startsWith("/auth");
  const needsRedirect = !isAuthRoute && !isLoading && !currentUser;

  const redirectToLogin = useCallback(() => {
    if (didRedirectRef.current) {
      return;
    }

    didRedirectRef.current = true;

    const nextParam = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
    router.replace(`/auth/login${nextParam}`);
  }, [pathname, router]);

  useEffect(() => {
    if (!needsRedirect) {
      return;
    }

    redirectToLogin();
  }, [needsRedirect, redirectToLogin]);

  if (isAuthRoute) {
    return <>{children}</>;
  }

  if (isLoading || needsRedirect) {
    return <ProcessingModal isOpen label="Procesando..." />;
  }

  return <>{children}</>;
}
