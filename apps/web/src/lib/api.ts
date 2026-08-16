import type { AuthResult } from "@ioma/types";
import { useAuthStore } from "@/stores/auth-store";

// Thin fetch wrapper — every API read/write goes through this (used from
// TanStack Query hooks), never an ad hoc `fetch` inside a component, per
// CLAUDE.md. Empty NEXT_PUBLIC_API_URL means "same origin" (production,
// behind the reverse proxy — see DEPLOYMENT.md); dev sets it to the API's
// own port directly.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errorCode?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function rawFetch(path: string, options: RequestInit, accessToken: string | null) {
  return fetch(`${API_BASE_URL}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });
}

// A single in-flight refresh is shared across concurrent 401s so a page
// that fires several authenticated requests at once doesn't each try to
// rotate the refresh token independently — the API's refresh-token reuse
// detection (see PROGRESS.md Sprint 1) would treat the second rotation of
// an already-rotated token as a stolen-token replay and revoke the whole
// session.
let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken, clearSession, setSession } = useAuthStore.getState();
  if (!refreshToken) return null;

  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const response = await rawFetch(
          "/auth/refresh",
          { method: "POST", body: JSON.stringify({ refreshToken }) },
          null,
        );
        if (!response.ok) {
          clearSession();
          return null;
        }
        const result: AuthResult = await response.json();
        setSession(result);
        return result.accessToken;
      } catch {
        clearSession();
        return null;
      } finally {
        refreshInFlight = null;
      }
    })();
  }

  return refreshInFlight;
}

export async function apiFetch<TResponse>(
  path: string,
  options?: RequestInit,
): Promise<TResponse> {
  const isRefreshCall = path === "/auth/refresh";
  const accessToken = useAuthStore.getState().accessToken;

  let response = await rawFetch(path, options ?? {}, accessToken);

  if (response.status === 401 && !isRefreshCall && accessToken) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      response = await rawFetch(path, options ?? {}, newToken);
    }
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(
      response.status,
      body?.message ?? "An unexpected error occurred.",
      body?.errorCode,
    );
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return response.json() as Promise<TResponse>;
}

// FormData upload — never set a JSON Content-Type header here, the browser
// must set its own `multipart/form-data; boundary=...` value. Shares the
// same access-token/401-refresh handling as apiFetch above.
export async function apiUpload<TResponse>(
  path: string,
  formData: FormData,
): Promise<TResponse> {
  const accessToken = useAuthStore.getState().accessToken;

  const send = (token: string | null) =>
    fetch(`${API_BASE_URL}/api${path}`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

  let response = await send(accessToken);

  if (response.status === 401 && accessToken) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      response = await send(newToken);
    }
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(
      response.status,
      body?.message ?? "An unexpected error occurred.",
      body?.errorCode,
    );
  }

  return response.json() as Promise<TResponse>;
}
