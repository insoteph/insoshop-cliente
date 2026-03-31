import { getAccessToken } from "@/modules/auth/lib/session";

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type PagedResult<T> = {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  items: T[];
};

type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | Record<string, unknown> | null;
  auth?: boolean;
  storeId?: number | null;
};

const DEFAULT_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "http://localhost:7166";

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
) {
  const {
    body,
    auth = true,
    headers,
    storeId,
    method = "GET",
    ...rest
  } = options;
  const requestHeaders = new Headers(headers);

  if (auth) {
    const accessToken = getAccessToken();
    if (accessToken) {
      requestHeaders.set("Authorization", `Bearer ${accessToken}`);
    }
  }

  if (storeId) {
    requestHeaders.set("X-Tienda-Id", String(storeId));
  }

  let payload: BodyInit | undefined;
  if (body instanceof FormData) {
    payload = body;
  } else if (typeof body === "string" || body instanceof URLSearchParams) {
    payload = body;
  } else if (body !== undefined && body !== null) {
    requestHeaders.set("Content-Type", "application/json");
    payload = JSON.stringify(body);
  }

  const response = await fetch(`${DEFAULT_API_BASE_URL}${path}`, {
    method,
    headers: requestHeaders,
    body: payload,
    credentials: "include",
    cache: "no-store",
    ...rest,
  });

  const result = (await response.json()) as ApiResponse<T> | {
    message?: string;
  };

  if (!response.ok || ("success" in result && !result.success)) {
    throw new Error(result.message || "La operación no pudo completarse.");
  }

  return result as ApiResponse<T>;
}
