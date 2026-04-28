import { loginApi } from "@/modules/auth/api/login-api";
import type {
  LoginRequest,
  LoginResponse,
  LoginSession,
} from "@/modules/auth/types/auth-types";
import { setAccessToken } from "@/modules/auth/lib/session";

function buildLoginSession(data: LoginResponse): LoginSession {
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

export async function loginService(payload: LoginRequest) {
  const response = await loginApi(payload);
  const session = buildLoginSession(response.data);

  setAccessToken(session.token);

  return session;
}

