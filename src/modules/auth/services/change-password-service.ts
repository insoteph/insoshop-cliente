import { changePasswordApi } from "@/modules/auth/api/change-password-api";
import type { ChangePasswordRequest } from "@/modules/auth/types/auth-types";

export async function changePasswordService(payload: ChangePasswordRequest) {
  const response = await changePasswordApi(payload);
  return response.data;
}
