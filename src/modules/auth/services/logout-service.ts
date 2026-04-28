import { logoutApi } from "@/modules/auth/api/logout-api";
import { sessionApi } from "@/modules/auth/api/session-api";
import { setAccessToken } from "@/modules/auth/lib/session";

async function refreshAccessTokenForLogout() {
  const response = await sessionApi();
  setAccessToken(response.data.token);
}

export async function logoutService() {
  try {
    await logoutApi();
    return;
  } catch {
    await refreshAccessTokenForLogout();
    await logoutApi();
  }
}
