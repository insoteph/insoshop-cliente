import { sessionApi } from "@/modules/auth/api/session-api";
import {
  clearAccessToken,
  getAccessToken,
  getSessionCacheStatus,
  setAccessToken,
  setSessionCacheStatus,
} from "@/modules/auth/lib/session";

const SESSION_TIMEOUT_MS = 7000;
const SESSION_RETRY_ATTEMPTS = 1;

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function refreshSessionOnce() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SESSION_TIMEOUT_MS);

  try {
    const response = await sessionApi(controller.signal);
    setAccessToken(response.data.token);
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function ensureSession() {
  const cacheStatus = getSessionCacheStatus();

  if (cacheStatus === "authenticated" && getAccessToken()) {
    return true;
  }

  if (cacheStatus === "unauthenticated") {
    return false;
  }

  for (let attempt = 0; attempt <= SESSION_RETRY_ATTEMPTS; attempt += 1) {
    const hasSession = await refreshSessionOnce();

    if (hasSession) {
      return true;
    }

    if (attempt < SESSION_RETRY_ATTEMPTS) {
      await sleep(350);
    }
  }

  clearAccessToken();
  return false;
}

export async function refreshSession() {
  const response = await sessionApi();
  setAccessToken(response.data.token);
  setSessionCacheStatus("authenticated");
  return response.data;
}
