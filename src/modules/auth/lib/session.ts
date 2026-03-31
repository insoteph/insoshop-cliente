export type SessionCacheStatus =
  | "unknown"
  | "authenticated"
  | "unauthenticated";

let accessTokenMemory: string | null = null;
let sessionCacheStatus: SessionCacheStatus = "unknown";

export function getAccessToken() {
  return accessTokenMemory;
}

export function setAccessToken(token: string) {
  accessTokenMemory = token;
  sessionCacheStatus = "authenticated";
}

export function clearAccessToken() {
  accessTokenMemory = null;
  sessionCacheStatus = "unauthenticated";
}

export function getSessionCacheStatus() {
  return sessionCacheStatus;
}

export function setSessionCacheStatus(status: SessionCacheStatus) {
  sessionCacheStatus = status;
}
