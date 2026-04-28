import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "@/modules/auth/lib/session";

export type ApiResponse<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  data?: unknown;
};

export type PagedResult<T> = {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  items: T[];
};

type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | Record<string, unknown> | string | number | boolean | null;
  auth?: boolean;
  storeId?: number | null;
};

const DEFAULT_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "http://localhost:7166/api";

let refreshSessionPromise: Promise<boolean> | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function buildApiUrl(path: string) {
  const normalizedBase = DEFAULT_API_BASE_URL.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

async function refreshAccessTokenFromSession() {
  if (!refreshSessionPromise) {
    refreshSessionPromise = (async () => {
      try {
        const response = await fetch(buildApiUrl("/Auth/session"), {
          method: "POST",
          credentials: "include",
          cache: "no-store",
        });

        const session = await readApiResponse<{ token: string }>(response);
        setAccessToken(session.data.token);
        return true;
      } catch {
        clearAccessToken();
        return false;
      }
    })().finally(() => {
      refreshSessionPromise = null;
    });
  }

  return refreshSessionPromise;
}

async function readApiResponse<T>(response: Response) {
  let payload: unknown = null;

  try {
    payload = await response.json();
  } catch {
    if (!response.ok) {
      throw new Error("No se pudo procesar la respuesta de la API.");
    }

    throw new Error("La API devolvio una respuesta invalida.");
  }

  if (!isRecord(payload)) {
    throw new Error("La API devolvio un formato de respuesta no valido.");
  }

  const message =
    typeof payload.message === "string"
      ? payload.message
      : "La operacion no pudo completarse.";

  if (!response.ok) {
    throw new Error(message);
  }

  if (payload.success !== true) {
    throw new Error(message);
  }

  if (!("data" in payload)) {
    throw new Error("La API no devolvio el campo data.");
  }

  return payload as ApiResponse<T>;
}

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
  let payload: BodyInit | undefined;
  let shouldSetJsonContentType = false;

  if (body instanceof FormData) {
    payload = body;
  } else if (typeof body === "string" || body instanceof URLSearchParams) {
    payload = body;
  } else if (body !== undefined && body !== null) {
    shouldSetJsonContentType = true;
    payload = JSON.stringify(body);
  }

  const executeRequest = () => {
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

    if (
      shouldSetJsonContentType &&
      !requestHeaders.has("Content-Type")
    ) {
      requestHeaders.set("Content-Type", "application/json");
    }

    return fetch(buildApiUrl(path), {
      method,
      headers: requestHeaders,
      body: payload,
      credentials: "include",
      cache: "no-store",
      ...rest,
    });
  };

  let response = await executeRequest();

  if (auth && response.status === 401) {
    const refreshed = await refreshAccessTokenFromSession();

    if (refreshed) {
      response = await executeRequest();
    }
  }

  if (auth && response.status === 401) {
    clearAccessToken();
    throw new Error("Tu sesión expiró. Vuelve a iniciar sesión.");
  }

  return readApiResponse<T>(response);
}
