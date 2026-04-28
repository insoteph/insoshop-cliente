import { apiFetch } from "@/modules/core/lib/api-client";
import type {
  ChangePasswordRequest,
  LoginResponse,
} from "@/modules/auth/types/auth-types";

export async function changePasswordApi(payload: ChangePasswordRequest) {
  return apiFetch<LoginResponse>("/Auth/change-password", {
    method: "POST",
    body: payload,
  });
}
