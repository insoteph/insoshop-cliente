import { changePasswordApi } from "@/modules/auth/api/change-password-api";
import { setAccessToken } from "@/modules/auth/lib/session";
import type {
  ChangePasswordRequest,
  LoginResponse,
  LoginSession,
} from "@/modules/auth/types/auth-types";

function buildChangePasswordSession(data: LoginResponse): LoginSession {
  if (!data.token) {
    throw new Error("No se recibio un token de acceso desde la API.");
  }

  return {
    token: data.token,
    expiration: data.expiration,
    requirePasswordChange: data.requirePasswordChange,
    refreshToken: data.refreshToken,
  };
}

export async function changePasswordService(payload: ChangePasswordRequest) {
  const response = await changePasswordApi(payload);
  const session = buildChangePasswordSession(response.data);

  setAccessToken(session.token);

  return session;
}
