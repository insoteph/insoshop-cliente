import type { ReactNode } from "react";

import { AuthLayout } from "@/layouts/AuthLayout";

type AuthRouteLayoutProps = {
  children: ReactNode;
};

export default function AuthRouteLayout({ children }: AuthRouteLayoutProps) {
  return <AuthLayout>{children}</AuthLayout>;
}
