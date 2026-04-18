import { apiFetch } from "@/modules/core/lib/api-client";
import type { LoginResponse } from "@/modules/auth/types/auth-types";

export async function sessionApi(signal?: AbortSignal) {
  return apiFetch<LoginResponse>("/Auth/session", {
    method: "POST",
    auth: false,
    signal,
    credentials: "include",
  });
}
