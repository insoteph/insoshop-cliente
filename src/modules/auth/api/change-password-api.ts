import { apiFetch } from "@/modules/core/lib/api-client";
import type { ChangePasswordRequest } from "@/modules/auth/types/auth-types";

export async function changePasswordApi(payload: ChangePasswordRequest) {
  return apiFetch<null>("/Auth/change-password", {
    method: "POST",
    body: payload,
  });
}
