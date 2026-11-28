function resolveApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (
    typeof window !== "undefined" &&
    window.location.hostname === "127.0.0.1"
  ) {
    return "http://127.0.0.1:8081/api";
  }
  return "http://localhost:8081/api";
}

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api";

export interface ApiEnvelope<T> {
  success: boolean;
  code?: string;
  message?: string;
  data: T;
}

export class ApiError extends Error {
  code?: string;
  status?: number;

  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

export async function apiRequestWithMeta<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T; message?: string }> {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const res = await fetch(`${resolveApiBaseUrl()}${normalizedPath}`, {
    ...options,
    headers,
    credentials: "include",
    cache: "no-store",
  });

  let payload: ApiEnvelope<T> | null = null;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }

  if (!res.ok || (payload && payload.success === false)) {
    let detailedError: string | undefined;
    if (
      payload?.data &&
      typeof payload.data === "object" &&
      !Array.isArray(payload.data)
    ) {
      const firstFieldMsg = Object.values(
        payload.data as Record<string, unknown>
      ).find((val): val is string => typeof val === "string" && val.trim().length > 0);
      if (firstFieldMsg) {
        detailedError = firstFieldMsg;
      }
    }
    const errorMsg =
      detailedError ||
      payload?.message ||
      `Yêu cầu thất bại (HTTP ${res.status})`;
    const errorCode = payload?.code;
    throw new ApiError(errorMsg, errorCode, res.status);
  }

  return {
    data: (payload ? payload.data : (null as unknown as T)),
    message: payload?.message,
  };
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const result = await apiRequestWithMeta<T>(path, options);
  return result.data;
}

