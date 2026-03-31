import { apiFetch } from "@/modules/core/lib/api-client";
import type {
  LoginRequest,
  LoginResponse,
} from "@/modules/auth/types/auth-types";

export async function loginApi(payload: LoginRequest) {
  return apiFetch<LoginResponse>("/Auth/Login", {
    method: "POST",
    body: payload,
    auth: false,
  });
}
